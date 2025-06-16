import os
import pydicom
from collections import defaultdict

# --- Configuration ---
TAGS_CONF_FILE_STUDY = "/home/amritansh/Desktop/meta_store/app/conf/StudyFeatures.txt"
TAGS_CONF_FILE_SERIES = "/home/amritansh/Desktop/meta_store/app/conf/SeriesFeatures.txt"
TAGS_CONF_FILE_INSTANCE = "/home/amritansh/Desktop/meta_store/app/conf/InstanceFeatures.txt"
PATIENT_DIR = "/usr/local/share/LIDC-IDRI-DICOM/LIDC-IDRI-0001"
MONGO_URI = "mongodb://admin:adminpass@mongo:27017/"
DB_NAME = "dicomdb"
RESEARCHER_NAME = "test"
COLLECTION_NAME = "test"



# --- Helpers ---

# return list of tags listed in a .txt file
def load_tags(conf_path):
    with open(conf_path, "r") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]


# return a dictionary of dicom tag:value from dcm and list of tags
def extract_tags(dcm, tags):
    return {tag: getattr(dcm, tag, "DOES NOT EXIST") for tag in tags}


# yield every .dcm file in the directory
def walk_dicom_files(base_dir):
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.lower().endswith(".dcm"):
                yield os.path.join(root, file)

# Update missing or None fields in existing dict with values from new dict.
def merge_tags(existing, new):
    for key, val in new.items():
        if key not in existing or existing[key] is None:
            existing[key] = val

               

def extract_metadata():
    study_tags = load_tags(TAGS_CONF_FILE_STUDY)
    series_tags = load_tags(TAGS_CONF_FILE_SERIES)  # Can be different if desired
    instance_tags = load_tags(TAGS_CONF_FILE_INSTANCE)

    studies = {}
    series_data = {}
    instances = defaultdict(list)

    for fpath in walk_dicom_files(PATIENT_DIR):
        
        try:
            dcm = pydicom.dcmread(fpath, stop_before_pixels=True)

            study_uid = dcm.StudyInstanceUID
            series_uid = dcm.SeriesInstanceUID
            instance_uid = dcm.SOPInstanceUID

            
            #count tag freq
            '''for elem in dcm.iterall():
                tag =  elem.keyword or elem.name
                if tag in tags:
                    tags[tag] += 1
                else:
                    tags[tag] = 1'''
            


             # --- Study-level (accumulate tags) ---
            new_study_data = extract_tags(dcm, study_tags)
            if study_uid not in studies:
                studies[study_uid] = new_study_data
            else:
                merge_tags(studies[study_uid], new_study_data)

            # --- Series-level (accumulate tags) ---
            new_series_data = extract_tags(dcm, series_tags)
            if series_uid not in series_data:
                series_data[series_uid] = {
                    "study_uid": study_uid,
                    "metadata": new_series_data
                }
            else:
                merge_tags(series_data[series_uid]["metadata"], new_series_data)

            # --- Instance-level (per file) ---
            instances[series_uid].append({
                "instance_uid": instance_uid,
                "file_path": fpath,
                "metadata": extract_tags(dcm, instance_tags)
            })

        except Exception as e:
            print(f"Failed to read {fpath}: {e}")

    return studies, series_data, instances


if __name__ == "__main__":
    studies, series, instance = extract_metadata()
    print(studies)

    

    
   
