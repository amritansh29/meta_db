import os
import pydicom

def estimate_header_size(dicom_path):
    # Read only metadata
    dcm = pydicom.dcmread(dicom_path, stop_before_pixels=True)
    # Save just the header to a temporary in-memory bytes stream
    from io import BytesIO
    buffer = BytesIO()
    dcm.save_as(buffer)
    return len(buffer.getvalue())

def walk_dicom_files(base_dir):
    for root, _, files in os.walk(base_dir):
        for fname in files:
            if fname.lower().endswith(".dcm"):
                yield os.path.join(root, fname)

# Aggregate over sample or all files
PATIENT_DIR = "/usr/local/share/LIDC-IDRI-DICOM"
MAX_FILES = 100  # Adjust as needed for sampling
total_size = 0
count = 0

for f in walk_dicom_files(PATIENT_DIR):
    try:
        size = estimate_header_size(f)
        total_size += size
        count += 1

        if count == 100:
            break
        
    except Exception as e:
        print(f"Error reading {f}: {e}")

print(f"Header size across {count} files: {total_size / 1024:.2f} KB")
print(f"Average header size per file: {total_size / count:.2f} bytes")
