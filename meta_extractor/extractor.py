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



# Indexed fields to be promoted
STUDY_PROMOTED = {"AccessionNumber", "StudyInstanceUID", "PatientID", "StudyDate", "StudyDescription", "Modality, AcquisitionDateTime"}
SERIES_PROMOTED = {"SeriesInstanceUID", "SeriesNumber", "SeriesDescription", "BodyPartExamined", "SeriesDate", "SeriesTime", "Manufacturer", "ManufacturerModelName", "ProtocolName", "KVP", "SliceThickness", "ImagePositionPatient"}
INSTANCE_PROMOTED = {"SOPInstanceUID", "SOPClassUID", "InstanceNumber", "AcquisitionDateTime", "ImageOrientation", "ImagePosition"}



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
            


             # Study (accumulate)
            study_meta = extract_tags(dcm, study_tags)
            if study_uid not in studies:
                studies[study_uid] = {"metadata": study_meta}
            else:
                merge_tags(studies[study_uid]["metadata"], study_meta)

            # Series (accumulate)
            series_meta = extract_tags(dcm, series_tags)
            if series_uid not in series_data:
                series_data[series_uid] = {"study_uid": study_uid, "metadata": series_meta}
            else:
                merge_tags(series_data[series_uid]["metadata"], series_meta)

            # Instance (one per file)
            instance_meta = extract_tags(dcm, instance_tags)
            instances[series_uid].append({
                "sop_instance_uid": instance_uid,
                "series_instance_uid": series_uid,
                "metadata": instance_meta
            })

        except Exception as e:
            print(f"Failed to read {fpath}: {e}")

    
    #Formatting data for inserting into DB:

    structured_studies = []
    for uid, data in studies.items():
        out = {"study_instance_uid": uid}
        for k in STUDY_PROMOTED:
            out[k.lower()] = data["metadata"].get(k)
        out["metadata"] = data["metadata"]
        structured_studies.append(out)

    structured_series = []
    for uid, data in series_data.items():
        out = {
            "series_instance_uid": uid,
            "study_instance_uid": data["study_uid"]
        }
        for k in SERIES_PROMOTED:
            out[k.lower()] = data["metadata"].get(k)
        out["metadata"] = data["metadata"]
        structured_series.append(out)

    structured_instances = []
    for series_uid, inst_list in instances.items():
        for inst in inst_list:
            out = {
                "sop_instance_uid": inst["sop_instance_uid"],
                "series_instance_uid": inst["series_instance_uid"]
            }
            for k in INSTANCE_PROMOTED:
                out[k.lower()] = inst["metadata"].get(k)
            out["metadata"] = inst["metadata"]
            structured_instances.append(out)

    return {
        "studies": structured_studies,
        "series": structured_series,
        "instances": structured_instances
    }


    

    

    
   
