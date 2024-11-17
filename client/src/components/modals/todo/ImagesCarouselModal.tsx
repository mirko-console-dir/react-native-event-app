import React, { useEffect, useMemo, useState } from 'react';
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
const {width, height} = Dimensions.get('screen');

const ImagesCarouselModal: React.FC<ImagesCarouselModalProps> = ({ isVisible, images, selectedIndex, onClose }) => {

  // Manipulate index to render correct order 
  const adjustedImages = useMemo(() => [
    ...images.slice(selectedIndex),
    ...images.slice(0, selectedIndex)
  ], [images, selectedIndex]);

  const renderCarouselItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.url ? item.url : item.uri }} style={styles.imgStyle} />
    </View>
  )

  const [currentImageFeedback, setCurrentImageFeedback] = useState(selectedIndex + 1);

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.container}>
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
          <View style={styles.subtitleContainer}>
            <Text style={styles.textSubtitle}>{`Image ${currentImageFeedback} of ${images.length}`}</Text>
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
  modal: { justifyContent: 'center', alignItems: 'center' },
  modalSafeArea: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: width 
  },
  container: { 
    width: width, 
    height: height / 2, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  subtitleContainer: { alignItems: 'center', marginTop: 10 },
  textSubtitle: { fontSize: 18, color: 'white' },
  closeButton: {
    marginTop: 10,
    position: 'absolute',
    top: 0,
    right: 10,
  },
  itemContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imgStyle: { width: '100%', height: '100%', resizeMode: 'contain' }
});
export default ImagesCarouselModal;
