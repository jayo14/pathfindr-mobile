from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, ProfileView,
    BuildingListView, EventListView,
    LostItemViewSet, SurveyCreateView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'lost-items', LostItemViewSet, basename='lost-item')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('buildings/', BuildingListView.as_view(), name='buildings'),
    path('events/', EventListView.as_view(), name='events'),
    path('surveys/', SurveyCreateView.as_view(), name='survey-create'),
    path('', include(router.urls)),
]
