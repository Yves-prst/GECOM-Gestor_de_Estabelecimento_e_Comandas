import React, { useState, useEffect } from 'react';

import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, StatusBar
} from 'react-native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { usePathname } from 'expo-router';


const ComandasOutros = () => {

    function goToComandasPagas() {
        router.navigate("./comandasPagas")
    }

    function goToHome() {
        router.navigate("/")
    }

    const pathname = usePathname();

    return (
        <View style={styles.main}>

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
                <StatusBar
                    barStyle="light-content" // ou "dark-content"
                    backgroundColor="#000" // cor de fundo da status bar (Android)
                />


            </ScrollView>

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuButton} onPress={goToHome}>
                    <FontAwesome5
                        name="home"
                        size={20}
                        color={pathname === '/' ? '#fff' : '#000'}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton} onPress={goToComandasPagas}>
                    <FontAwesome5
                        name="check-circle"
                        size={20}
                        color={pathname === '/comandasPagas' ? '#fff' : '#000'}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                    <FontAwesome5
                        name="user-check"
                        size={20}
                        color={pathname === '/comandasOutros' ? '#fff' : '#000'}
                    />
                </TouchableOpacity>

            </View>

        </View>

    );
}

export default ComandasOutros;

const styles = StyleSheet.create({

    main: {
        flex: 1,

    },

    container: {
        backgroundColor: '#f5f5f5',
        padding: 20,
        height: '85%'
    },


    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'dodgerblue',
        height: 60,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },

    menuButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        width: '30%'
    },
});