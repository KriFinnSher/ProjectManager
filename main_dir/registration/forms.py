from django import forms
from projects.models import User

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['avatar', 'status']


class RegistrationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['full_name', 'email', 'password']

    def save(self, commit=True):
        user = User.objects.create_user(
            full_name=self.cleaned_data['full_name'],
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password']
        )
        return user