import React, {useState} from 'react';
import { View, Text, Image, Dimensions,SafeAreaView } from 'react-native';
import Modal from 'react-native-modal';

import Carousel from 'react-native-reanimated-carousel';

type ImagesCarouselModalProps = {
  isVisible: boolean;
  images: any[];
  selectedIndex: number;
  onClose: () => void;
}

const ImagesCarouselModal: React.FC<ImagesCarouselModalProps> = ({ isVisible, images, selectedIndex, onClose }) => {
  const width = Dimensions.get('window').width;
  // Manipulate index to render correct order 
  const adjustedImages = [...images.slice(selectedIndex), ...images.slice(0, selectedIndex)];
  // END Manipulate index to render correct order 

  const renderCarouselItem = ({ item }: { item: any }) => (    
    <View style={{ flex: 1,  }}>
      <Image source={{ uri: item.url ? item.url : item.uri }} style={{ flex: 1, resizeMode: 'contain' }} />
    </View>
  );

  const [currentImageFeedback, setCurrentImageFeedback] = useState(selectedIndex + 1);
  
  return (
        <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <Carousel
            loop
            width={width}
            height={width / 2}
            autoPlay={false}
            data={adjustedImages}
            scrollAnimationDuration={500}
            onSnapToItem={(index) => setCurrentImageFeedback(index + 1)}
            renderItem={({ index }) => renderCarouselItem({ item: adjustedImages[index] })}
            style={{marginLeft: -20}}
        />
        <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontSize: 18, color: 'white' }}>{`Image ${currentImageFeedback} of ${images.length}`}</Text>
        </View>
        </Modal>
  );
};

export default ImagesCarouselModal;
