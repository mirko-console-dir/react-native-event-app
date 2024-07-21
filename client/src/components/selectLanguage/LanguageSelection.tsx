import { SafeAreaView, View, Text, FlatList,TouchableOpacity } from "react-native";
import styles from '../../styles'
import { useLanguageContext } from "../../utils/languages/LanguageProvider";
import { useCallback, useState } from "react";
import CountryFlag from "react-native-country-flag-icon";

const LanguageSelection = () => {
    const { language, setLanguage,translate } = useLanguageContext();
    const [langauageAvailable, setLanguageAvailable] = useState([
        {code:'en',flag:'gb', name: 'English'},
        {code:'it',flag:'it', name: 'Italiano'},
        {code:'jp',flag:'jp', name: '日本語'}
    ])
    const handleLanguageChange = useCallback((newLanguage: string) => {
        if (newLanguage !== language) {
          setLanguage(newLanguage);
        }
    },[language]);
    const renderLanguages = useCallback(({item}: any) => {
        return (
            <TouchableOpacity 
                style={{flexDirection: 'row', alignItems: 'center',gap: 20, paddingVertical: 10,marginVertical: 10}}
                onPress={()=>handleLanguageChange(item.code)}
            >
                <CountryFlag isoCode={item.flag} size={20} />
                <Text style={styles.h3}>{item.name}</Text>
            </TouchableOpacity>
        )
    },[handleLanguageChange])
    
    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.container}>
                <Text style={[styles.h1, styles.textCenter,{marginVertical: 20}]}>
                    {translate('profile.profileSelectLang.title')}
                </Text>
                <FlatList
                    data={langauageAvailable}
                    keyExtractor={(item)=>item.name}
                    renderItem={renderLanguages}
                    style={{marginLeft: 'auto', marginRight: 'auto'}}
                />
            </View>
        </SafeAreaView> 
    )
}

export default LanguageSelection