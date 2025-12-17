
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0003_remove_appointment_created_at_and_more'),
        ('consultations', '0001_initial'),
        ('users', '0009_alter_customuser_role'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='consultation',
            name='appointment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='consultations_appointments', to='appointments.appointment'),
        ),
        migrations.AlterField(
            model_name='consultation',
            name='doctor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='consultations_consultations', to='users.doctor'),
        ),
        migrations.AlterField(
            model_name='consultation',
            name='patient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='consultations_patients', to=settings.AUTH_USER_MODEL),
        ),
    ]