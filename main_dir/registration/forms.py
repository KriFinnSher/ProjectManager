from django import forms
from projects.models import User

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['avatar', 'status']


class RegistrationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['full_name', 'email', 'university_group' , 'password']

        widgets = {
            'full_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'university_group': forms.TextInput(attrs={'class': 'form-control'}),
            'password': forms.PasswordInput(attrs={'class': 'form-control'}),
        }

    def save(self, commit=True):
        user = User.objects.create_user(
            full_name=self.cleaned_data['full_name'],
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            university_group=self.cleaned_data['university_group']
        )
        return user