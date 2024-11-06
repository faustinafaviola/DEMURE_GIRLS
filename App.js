import React, { Fragment, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function App() {
  const [image, setImage] = useState(null);
  const predictionUrl = 'https://hkexpressclassification2-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/f47f8ad7-5e61-4437-919d-1428df87741c/classify/iterations/Iteration5/image'; // Replace with your Custom Vision Prediction URL
  const predictionKey = '8raZvlpKcq9hJK6jFgJbDrhfWTU2NPKPejP8NsfJ8EXehS14LwayJQQJ99AKACYeBjFXJ3w3AAAIACOGl2V6'; // Replace with your Custom Vision Prediction Key

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const launchCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });
  
      const result = await axios.post(predictionUrl, arrayBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Prediction-Key': predictionKey,
        },
      });
  
      // Extract predictions
      const predictions = result.data.predictions.map(prediction => ({
        tagName: prediction.tagName,
        probability: prediction.probability,
      }));
  
      // Create a string to display with categories
      const resultString = predictions.map(pred => {
        return `${pred.tagName}: ${(pred.probability * 100).toFixed(2)}%`;
      }).join('\n');
  
      // General message about categories
      let categoryMessage = 'General disposal guidance:\n';
      categoryMessage += 'RECYCABLE BIN Products: paper, plastics.\n';
      categoryMessage += 'NON-RECYCABLES BIN Products: tissue, chips, cup noodles.\n';
      categoryMessage += 'FOOD DISPOSAL BIN Products: mix (drinks), mix (canned chips).\n';
  
      // Display the results along with the category message
      Alert.alert('Analysis Result', resultString + '\n\n' + categoryMessage);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'An error occurred while analyzing the image.');
    }
  };
  
  const logo = require('./asset/hkexpress_logo.png');

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={styles.body}>
          <Image source={logo} style={styles.headerImage} resizeMode="contain"/>
          <Text style={{ textAlign: 'center', fontSize: 30, paddingBottom: 10, color: 'white', fontWeight:'600' }}>
            EcoSort 
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 15, paddingBottom: 10, color: 'white' }}>
            The future of inflight recycling is here
          </Text>
          <View style={styles.ImageSections}>
            <View>
              <Image
                source={image ? { uri: image } : require('./asset/vlt.jpeg')}
                style={styles.images}
              />
            </View>
          </View>
          <View style={styles.btnParentSection}>
            <TouchableOpacity onPress={chooseImage} style={styles.btnSection}>
              <Text style={styles.btnText}>Choose Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={launchCamera} style={styles.btnSection}>
              <Text style={styles.btnText}>Use Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },
  body: {
    backgroundColor: '#a55ec4',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    height: Dimensions.get('screen').height - 20,
    width: Dimensions.get('screen').width,
  },
  headerImage: {
    width: '50%',
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
  },
  ImageSections: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  images: {
    width: 250,
    height: 250,
    borderColor: '#7bdeed',
    borderWidth: 2,
    marginHorizontal: 3,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20
  },
  btnParentSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  btnSection: {
    width: 225,
    height: 50,
    backgroundColor: '#732a94',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginBottom: 10,
  },
  btnText: {
    textAlign: 'center',
    color: '#7bdeed',
    fontSize: 14,
    fontWeight: 'bold',
  },
});