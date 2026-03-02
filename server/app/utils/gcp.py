from fastapi import FastAPI, HTTPException
from google.cloud import storage
import re
app = FastAPI()

# Hardcoded values
BUCKET_NAME = "genresume_bucket"
FILE_CONTENT = b"This is my hardcoded content"
FILE_NAME = "sample_file.png"
CONTENT_TYPE = "text/plain"

def upload_to_gcs(file_content, file_name: str, content_type: str, bucket_path: str) -> str:
    """Uploads a file to Google Cloud Storage and returns the public URL."""
    try:
        full_path=f"{bucket_path}{file_name}"
        
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)

        print(f"Creating blob with name: {file_name}")
        blob = bucket.blob(full_path)

        print(f"{file_name} uploading to {BUCKET_NAME}.")
        blob.upload_from_string(file_content)
    
        print("Making the file publicly accessible...")
        # blob.make_public() this won't work due to no acl in bucket, now automatically causes public

        print(f"File {file_name} uploaded to bucket {BUCKET_NAME}.")
        return blob.public_url

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file to GCS: {str(e)}")

def upload_blob(bucket_name, source_file_name, destination_blob_name):
    """Uploads a file to the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(destination_blob_name)

    # Optional: set a generation-match precondition to avoid potential race conditions
    generation_match_precondition = 0

    # Upload the file from the local system
    blob.upload_from_filename(source_file_name, if_generation_match=generation_match_precondition)

    print(f"File {source_file_name} uploaded to {destination_blob_name}.")
    return blob.public_url


def list_files():
    """
    FastAPI endpoint to list all files in the GCS bucket.
    """
    try:
        print("Initializing GCS client...")
        storage_client = storage.Client()
        blobs = storage_client.list_blobs(BUCKET_NAME)

        files = []
        for blob in blobs:
            files.append(blob.public_url)

        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")
    