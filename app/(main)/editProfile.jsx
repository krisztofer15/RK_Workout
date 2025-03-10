import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Header from '../../components/Header'
import { Image } from 'expo-image'
import { useAuth } from '../../contexts/AuthContext'
import { getUserImageSrc, uploadFile } from '../../services/imageService'
import Icon from '../../assets/Icons'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { updateUser } from '../../services/userService'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

const EditProfile = () => {

    const {user: currentUser, setUserData} = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [user, setUser] = useState({
        name: '',
        phoneNumber: '',
        image: null,
        bio: '',
        address: '',
    });

    useEffect(() => {
        if(currentUser) {
            setUser({
                name: currentUser.user_metadata.name,
                phoneNumber: currentUser.user_metadata.phoneNumber,
                image: currentUser.user_metadata.image,
                bio: currentUser.user_metadata.bio,
                address: currentUser.user_metadata.address
            });
        }
    }, [currentUser])

    const onPickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if(!result.canceled) {
            setUser({...user, image: result.assets[0]});
        }
    }

    const onSubmit = async () => {
        let userData = {...user};
        let {name, phoneNumber, address, image, bio} = userData;
        if(!name || !phoneNumber || !bio || !address || !image) {
            Alert.alert('Please fill all the fields');
            return;
        }
        setLoading(true);
        console.log('image: ', image);

        if(typeof image === 'object' && image?.uri) {
            let imageRes = await uploadFile('profile', image?.uri, true);
            if(imageRes.success) userData.image = imageRes.data;
            else userData.image = null;
        }
        //Update user data

        const res = await updateUser(currentUser.id, userData);
        setLoading(false);

        if(res.success) {
            setUserData({...currentUser, user_metadata:  {...currentUser.user_metadata, ...userData}});
            router.push('/profile');
        }
    }

    let imageSource = user.image && typeof user.image == 'object'? user.image.uri : getUserImageSrc(user.image);

  return (
    <ScreenWrapper bg="white">
      <View style={styles.cotainer}>
        <ScrollView style={{flex: 1}}>
            <Header title="Edit Profile" />

            {/* form */}
            <View style={styles.form}>
                <View style={styles.avatarContainer}>
                    <Image source={imageSource} style={styles.avatar} />
                    <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                        <Icon name="camera" size={20} strokeWidth={2.5} color={theme.colors.primary} />
                    </Pressable>
                </View>
                <Text style={{fontSize: hp(1.5), color: theme.colors.text}}>
                    Please fill your profile details
                </Text>
                
                <Input
                    icon={<Icon name="user" color={theme.colors.primary} />}
                    placeholder='Enter your name'
                    value={user.name}
                    onChangeText={value => setUser({...user, name: value})}
                />

                <Input
                    icon={<Icon name="call" color={theme.colors.primary} />}
                    placeholder='Enter your phone number'
                    value={user.phoneNumber}
                    onChangeText={value => setUser({...user, phoneNumber: value})}
                />

                <Input
                    icon={<Icon name="location" color={theme.colors.primary} />}
                    placeholder='Enter your address'
                    value={user.address}
                    onChangeText={value => setUser({...user, address: value})}
                />

                <Input
                    placeholder='Enter your bio'
                    value={user.bio}
                    multiline={true}
                    containerStyle={styles.bio}
                    onChangeText={value => setUser({...user, bio: value})}
                />

                <Button title="Update" loading={loading} onPress={onSubmit} />
            </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default EditProfile

const styles = StyleSheet.create({
    cotainer: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    avatarContainer: {
        height: hp(14),
        width: hp(14),
        alignSelf: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: theme.radius.xxl*1.8,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        padding: 8,
        borderRadius: 50,
        backgroundColor: 'white',
        shadowColor: theme.colors.textLigth,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 7
    },
    form: {
        gap: 18,
        marginTop: 20
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        borderCurve: 'continuous',
        padding: 17,
        paddingHorizontal: 20,
        gap: 15,
    },
    bio: {
        flexDirection: 'row',
        height: hp(15),
        alignItems: 'flex-start',
        paddingVertical: 15,
    }
})