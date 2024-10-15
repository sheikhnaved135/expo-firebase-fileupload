import {
  View,
  Text,
  Alert,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { firebase } from "../config"; // Assuming Firebase is initialized here

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null); // Store uploaded file URL
  const [allFiles, setAllFiles] = useState([]); // Store list of all files
  const [load, setLoad] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Store upload progress

  const handleSelect = async () => {
    setLoad(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result.assets[0]); // Store the selected file
      }
    } catch (err) {
      console.log("Error picking document: ", err);
    } finally {
      setLoad(false);
    }
  };

  const handleUpload = async () => {
    setLoad(true);
    setUploadProgress(0); // Reset upload progress

    if (!file) return Alert.alert("No file selected!");

    try {
      const res = await fetch(file?.uri);
      const uploadFile = await res.blob();
      const ref = firebase.storage().ref().child(`uploads/${file.name}`);
      const uploadTask = ref.put(uploadFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle errors during upload
          console.error("Upload error: ", error);
          Alert.alert("Upload error: ", error.message);
        },
        async () => {
          // Upload completed successfully
          const downloadUrl = await ref.getDownloadURL();
          setFileURL(downloadUrl); // Set the download URL in state
          handleListFiles(); // Fetch files again to refresh the list
          setFile(null);
          Alert.alert("File uploaded successfully!");
        }
      );
    } catch (error) {
      setLoad(false);
      console.error("File upload error: ", error);
    }
  };

  const handleListFiles = async () => {
    setLoad(true);
    setUploadProgress(0);
    try {
      const storageRef = firebase.storage().ref().child("uploads/");
      setUploadProgress(20);

      const list = await storageRef.listAll();
      setUploadProgress(50);
      // Get list of all files
      const files = await Promise.all(
        list.items.map(async (item) => {
          const url = await item.getDownloadURL();
          return { name: item.name, url };
        })
      );
      setAllFiles(files);
      setUploadProgress(100);
      // Store the list of files
    } catch (error) {
      console.error("Error listing files: ", error);
      setUploadProgress(100);
    } finally {
      setLoad(false);
    }
  };

  // Check if the file is an image
  const isImageFile = (fileName) => {
    return /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  };

  return (
    <View style={styles.container}>
      {load ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={"large"} color="#007AFF" />
          <Text style={styles.loadingText}>{uploadProgress.toFixed(0)}%</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
            <Text style={styles.buttonText}>Select File</Text>
          </TouchableOpacity>

          {file && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <Text style={styles.buttonText}>Upload File</Text>
            </TouchableOpacity>
          )}
          {/* Display selected file details */}
          {file && (
            <View style={styles.fileDetails}>
              <Text style={styles.fileText}>Selected File: {file.name}</Text>
              <Text style={styles.fileText}>File Type: {file.mimeType}</Text>
            </View>
          )}
          {/* Button to list all files */}
          <TouchableOpacity style={styles.listButton} onPress={handleListFiles}>
            <Text style={styles.buttonText}>View All Files</Text>
          </TouchableOpacity>
          {/* Display all files (in a scrollable view) */}
          <ScrollView style={styles.scrollView}>
            {allFiles.map((file, index) => (
              <View key={index} style={styles.fileContainer}>
                <Text style={styles.fileName}>File Name: {file.name}</Text>
                {isImageFile(file.name) ? (
                  <TouchableOpacity
                    onLongPress={() => Linking.openURL(file.url)}
                  >
                    <Image source={{ uri: file.url }} style={styles.image} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => Linking.openURL(file.url)}>
                    <Text style={styles.downloadLink}>
                      Download {file.name}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4", // Light background for better contrast
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#007AFF", // Blue color for text
  },
  selectButton: {
    backgroundColor: "#007AFF", // Blue color for buttons
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  listButton: {
    backgroundColor: "#34C759", // Green color for buttons
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFFFFF", // White text for better contrast
  },
  fileDetails: {
    marginTop: 20,
    alignItems: "center",
  },
  fileText: {
    fontSize: 16,
    color: "#333", // Dark text for readability
  },
  scrollView: {
    marginTop: 20,
    width: "100%",
  },
  fileContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D0D0D0", // Light border for separation
  },
  fileName: {
    fontSize: 16,
    color: "#333",
  },
  downloadLink: {
    color: "#007AFF", // Blue color for links
    marginTop: 10,
    fontSize: 16,
  },
  image: {
    width: "100%", // Full width to ensure centering
    height: 200,
    resizeMode: "contain",
    marginTop: 10,
  },
});

export default FileUploader;
