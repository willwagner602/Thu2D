__author__ = 'wwagner'

from django.conf.urls import url
from django.views.generic import TemplateView

urlpatterns = [
        url(r"^$", TemplateView.as_view(template_name='Thu2D.html', )),
    ]
