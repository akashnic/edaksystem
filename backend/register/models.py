from django.db import models

class Receive(models.Model):
    l_id = models.AutoField(primary_key=True)
    diary_number = models.IntegerField(default=1)
    letter_number = models.CharField(max_length=100)
    letter_date = models.DateField()
    sender_name = models.CharField(max_length=255, null=True, blank=True)
    sender_address = models.TextField(null=True, blank=True)
    sender_contact = models.CharField(max_length=100, null=True, blank=True)
    subject = models.TextField(null=True, blank=True)
    date_of_receipt = models.DateField(null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    letter_image = models.ImageField(upload_to='receipt_images/', null=True, blank=True)
    
    STATUS_CHOICES = (
        ('NEW', 'NEW'),
        ('DISPATCHED', 'DISPATCHED'),
        ('RECEIVED', 'RECEIVED'),
    )
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.letter_number} - {self.subject}"

class Dispatch(models.Model):
    dispatch_id = models.AutoField(primary_key=True)
    receive = models.ForeignKey(Receive, on_delete=models.CASCADE, related_name='dispatches')
    receiver_officer_department = models.CharField(max_length=255)
    dispatch_number = models.CharField(max_length=100)
    receiver_name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20, null=True, blank=True)
    signature_image = models.TextField(null=True, blank=True)
    
    STATUS_CHOICES = (
        ('NOT_RECEIVED', 'NOT_RECEIVED'),
        ('RECEIVED', 'RECEIVED'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_RECEIVED')
    
    dispatched_at = models.DateTimeField(auto_now_add=True)
    received_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Dispatch {self.dispatch_number} for Receive {self.receive.l_id}"
