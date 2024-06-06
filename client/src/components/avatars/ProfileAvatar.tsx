import React from 'react';
import { Image, Dimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';

const ProfileAvatar =  React.memo(({ user }:any  ) => {
    const width = Dimensions.get('window').width;
    const avatarWidth = width / 5
    const avatarHeight = avatarWidth 
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user">
    <circle cx="12" cy="12" r="11" fill="lightgray"></circle>
    <path d="M20 19v-2a4 4 0 0 0-4-2H8a4 4 0 0 0-4 2v2"></path>
    <circle cx="12" cy="9" r="3"></circle>
    </svg>`;
    // Check if the user has an avatar
    if (user.avatar != null) {
      /* const decodedAvatar = atob(user.avatar.data);*/      
      const decodedAvatar = btoa(
        String.fromCharCode( ...new Uint8Array(user.avatar.data))
      ) 
      console.log('decodedAvatar')

      return (
        <Image
            source={{ uri: `data:image/png;base64,${decodedAvatar}` }}
            style={{ width: avatarWidth,height: avatarHeight, borderRadius: 50 }}
        />
      );
    }
    return (
          <SvgXml
            xml={svgString}
            width={avatarWidth}
            height={avatarHeight}
          />
    );
  });
  
export default ProfileAvatar