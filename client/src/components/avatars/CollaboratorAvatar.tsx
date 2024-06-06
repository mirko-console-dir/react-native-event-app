import React from 'react';
import { Image } from 'react-native';
import { SvgXml } from 'react-native-svg';

const CollaboratorAvatar = ({ collaborator, style }: any  ) => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user">
    <circle cx="12" cy="12" r="11" fill="lightgray"></circle>
    <path d="M20 19v-2a4 4 0 0 0-4-2H8a4 4 0 0 0-4 2v2"></path>
    <circle cx="12" cy="9" r="3"></circle>
    </svg>`;
    // Check if the collaborator has an avatar
    console.log(collaborator)

    if (collaborator.avatar != null) {
      console.log(collaborator.avatar)
      // Decode avatar data using createFromBase64
      let decodedAvatar
      if(collaborator.avatar.data){
        decodedAvatar = btoa(
          String.fromCharCode( ...new Uint8Array(collaborator.avatar.data))
        ) 
      } else {
        decodedAvatar = collaborator.avatar
      }

      return (
        <Image
          source={{ uri: `data:image/png;base64,${decodedAvatar}` }}
          style={{ width: 30,height: 30, borderRadius: 50 }}
        />
      );
    }
  
    return (
       /*  source={{
            uri: Asset.fromModule(require("../../../assets/backgrounds/backgroundProjectsItem.png")).uri,
          }} */
          <SvgXml
            xml={svgString}
            width="30"
            height="30"
            />
    );
  };
  
export default CollaboratorAvatar