
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_doctor'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(choices=[('doctor', 'Doctor'), ('patient', 'Patient'), ('admin', 'Admin')], default='patient', max_length=20),
        ),
    ]