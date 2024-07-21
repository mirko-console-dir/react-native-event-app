import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Image, Dimensions, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Carousel from 'react-native-reanimated-carousel';
import { Feather } from '@expo/vector-icons';

type ImagesCarouselModalProps = {
  isVisible: boolean;
  images: any[];
  selectedIndex: number;
  onClose: () => void;
}

const ImagesCarouselModal: React.FC<ImagesCarouselModalProps> = ({ isVisible, images, selectedIndex, onClose }) => {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height; 
  // Manipulate index to render correct order 
  const adjustedImages = useMemo(() => [
    ...images.slice(selectedIndex),
    ...images.slice(0, selectedIndex)
  ], [images, selectedIndex]);
  
  const renderCarouselItem = useCallback(({ item }: { item: any }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image source={{ uri: item.url ? item.url : item.uri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
    </View>
  ), []);

  const [currentImageFeedback, setCurrentImageFeedback] = useState(selectedIndex + 1);

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width }}>
        <View style={{ width, height: height / 2, justifyContent: 'center', alignItems: 'center' }}>
          <Carousel
            loop
            width={width}
            height={height / 2} 
            autoPlay={false}
            data={adjustedImages}
            scrollAnimationDuration={500}
            onSnapToItem={(index) => setCurrentImageFeedback(index + 1)}
            renderItem={({ index }) => renderCarouselItem({ item: adjustedImages[index] })}
          />
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontSize: 18, color: 'white' }}>{`Image ${currentImageFeedback} of ${images.length}`}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name={'x-circle'} size={45} color={'white'}/>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    marginTop: 10,
    position: 'absolute',
    top: 0,
    right: 10,
  }
});
export default ImagesCarouselModal;
