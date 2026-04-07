from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Receive, Dispatch
from .serializers import ReceiveSerializer, DispatchSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from accounts.permissions import IsReceiverUser, IsDispatcherUser

class ReceiveViewSet(viewsets.ModelViewSet):
    queryset = Receive.objects.all().order_by('-l_id')
    serializer_class = ReceiveSerializer
    permission_classes = [IsReceiverUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['date_of_receipt', 'current_status']
    search_fields = ['subject', 'sender_name', 'diary_number', 'letter_number']
    ordering_fields = ['date_of_receipt', 'l_id']

class DispatchViewSet(viewsets.ModelViewSet):
    queryset = Dispatch.objects.all().order_by('-dispatch_id')
    serializer_class = DispatchSerializer
    permission_classes = [IsReceiverUser | IsDispatcherUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'receiver_officer_department']
    search_fields = ['receiver_name', 'dispatch_number', 'receive__subject']
    ordering_fields = ['dispatched_at', 'dispatch_id']

    def create(self, request, *args, **kwargs):
        receive_id = request.data.get('receive')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # update receive
        if receive_id:
            receive = Receive.objects.get(l_id=receive_id)
            if receive.current_status == 'NEW':
                receive.current_status = 'DISPATCHED'
                receive.save()
                
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['put'], url_path='mark-received')
    def mark_received(self, request, pk=None):
        dispatch = self.get_object()
        if dispatch.status == 'NOT_RECEIVED':
            if 'receiver_name' in request.data:
                dispatch.receiver_name = request.data['receiver_name']
            if 'mobile_number' in request.data:
                dispatch.mobile_number = request.data['mobile_number']
            if 'signature_image' in request.data:
                dispatch.signature_image = request.data['signature_image']
                
            dispatch.status = 'RECEIVED'
            dispatch.received_at = timezone.now()
            dispatch.save()
            
            receive = dispatch.receive
            receive.current_status = 'RECEIVED'
            receive.save()
            
            return Response({'status': 'Marked as received'}, status=status.HTTP_200_OK)
        return Response({'error': 'Already received or invalid state'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk-dispatch')
    def bulk_dispatch(self, request):
        receive_ids = request.data.get('receives', [])
        departments = request.data.get('departments', [])
        
        if not receive_ids or not departments:
            return Response({'error': 'receives and departments are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        dispatches_created = []
        for r_id in receive_ids:
            try:
                receive = Receive.objects.get(l_id=r_id)
            except Receive.DoesNotExist:
                continue
                
            for dept in departments:
                dispatch_data = {
                    'receive': receive.l_id,
                    'receiver_officer_department': dept.get('receiver_officer_department'),
                    'dispatch_number': dept.get('dispatch_number'),
                    'receiver_name': '-',
                    'mobile_number': '-'
                }
                serializer = self.get_serializer(data=dispatch_data)
                if serializer.is_valid():
                    dispatch = serializer.save()
                    dispatches_created.append(serializer.data)
                    
            if receive.current_status == 'NEW':
                receive.current_status = 'DISPATCHED'
                receive.save()
                
        return Response(dispatches_created, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='bulk-mark-received')
    def bulk_mark_received(self, request):
        dispatch_ids = request.data.get('dispatch_ids', [])
        receiver_name = request.data.get('receiver_name', '-')
        mobile_number = request.data.get('mobile_number', '-')
        signature_image = request.data.get('signature_image', '')
        
        if not dispatch_ids:
            return Response({'error': 'dispatch_ids are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        updated_count = 0
        now = timezone.now()
        
        for d_id in dispatch_ids:
            try:
                dispatch = Dispatch.objects.get(dispatch_id=d_id)
                if dispatch.status == 'NOT_RECEIVED':
                    dispatch.receiver_name = receiver_name
                    dispatch.mobile_number = mobile_number
                    dispatch.signature_image = signature_image
                    dispatch.status = 'RECEIVED'
                    dispatch.received_at = now
                    dispatch.save()
                    
                    receive = dispatch.receive
                    receive.current_status = 'RECEIVED'
                    receive.save()
                    
                    updated_count += 1
            except Dispatch.DoesNotExist:
                continue
                
        return Response({'status': f'Marked {updated_count} as received'}, status=status.HTTP_200_OK)
