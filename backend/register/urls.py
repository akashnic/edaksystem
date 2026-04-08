from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReceiveViewSet, DispatchViewSet

router = DefaultRouter()
router.register(r'receive', ReceiveViewSet)
router.register(r'dispatch', DispatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
