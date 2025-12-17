
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_doctorprofile_patientprofile'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='phone',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]