# from cryptography.hazmat.backends import default_backend
# from cryptography.hazmat.primitives import serialization
# from cryptography.hazmat.primitives.asymmetric import ec
# import base64
# import json

# # Generate private key
# private_key = ec.generate_private_key(
#     ec.SECP256R1(),
#     default_backend()
# )

# # Get public key
# public_key = private_key.public_key()

# # Serialize private key to PEM
# private_pem = private_key.private_bytes(
#     encoding=serialization.Encoding.PEM,
#     format=serialization.PrivateFormat.PKCS8,
#     encryption_algorithm=serialization.NoEncryption()
# ).decode('utf-8')

# # Get raw public key bytes
# public_bytes = public_key.public_bytes(
#     encoding=serialization.Encoding.X962,
#     format=serialization.PublicFormat.UncompressedPoint
# )

# # Base64url encode public key without padding
# public_key_b64 = base64.urlsafe_b64encode(public_bytes).rstrip(b'=').decode('utf-8')

# # Prepare data
# data = {
#     'public_key': public_key_b64,
#     'private_key': private_pem
# }

# # Write to JSON file
# with open('vapid_keys.json', 'w') as f:
#     json.dump(data, f)

from pywebpush import webpush, WebPushException
import json

# Generate VAPID keys using pywebpush's built-in generator
vapid_keys = webpush.generate_vapid_keys()

# Save keys to a file
with open('vapid_keys.json', 'w') as f:
    json.dump({
        'public_key': vapid_keys.get('public_key'),
        'private_key': vapid_keys.get('private_key')
    }, f)

print("VAPID keys generated and saved to vapid_keys.json")
print(f"Public key: {vapid_keys.get('public_key')}")
print(f"Private key: {vapid_keys.get('private_key')}")