from rest_framework import serializers
from .models import Receive, Dispatch

class DispatchSerializer(serializers.ModelSerializer):
    receive_letter_number = serializers.CharField(source='receive.letter_number', read_only=True)
    receive_subject = serializers.CharField(source='receive.subject', read_only=True)
    
    class Meta:
        model = Dispatch
        fields = '__all__'

class ReceiveSerializer(serializers.ModelSerializer):
    dispatches = DispatchSerializer(many=True, read_only=True)
    diary_number = serializers.IntegerField(read_only=True, default=1)
    
    class Meta:
        model = Receive
        fields = '__all__'
