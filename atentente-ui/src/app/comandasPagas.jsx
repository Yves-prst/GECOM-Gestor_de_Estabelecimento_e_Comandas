import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, Alert,
    TouchableOpacity, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { usePathname } from 'expo-router';

const ComandasPagas = () => {

    function goToHome() {
        router.navigate("./")
    }

    function goToOutrasComandas() {
        router.navigate("./comandasOutros")
    }

    const [comandasPagas, setComandasPagas] = useState([]);
    const [totalGeral, setTotalGeral] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        carregarComandasPagas();
    }, []);

    const carregarComandasPagas = async () => {
        try {
            const saved = await AsyncStorage.getItem('comandasPagas');
            if (saved) {
                const lista = JSON.parse(saved);
                setComandasPagas(lista);
                const total = lista.reduce((soma, item) => soma + item.total, 0);
                setTotalGeral(total);
            }
        } catch (e) {
            console.error('Erro ao carregar comandas pagas', e);
        }
    };

    const zerarComandas = async () => {
        Alert.alert(
            'Confirmar',
            'Deseja apagar todas as comandas pagas?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Zerar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('comandasPagas');
                            setComandasPagas([]);
                            setTotalGeral(0);
                        } catch (e) {
                            console.error('Erro ao apagar comandas pagas', e);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.main}>
                    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 90 }}>

                        <Text style={styles.titulo}>Comandas Pagas</Text>
                        <Text style={styles.total}>Total Geral: R$ {totalGeral.toFixed(2)}</Text>

                        <TouchableOpacity style={styles.clearButton} onPress={zerarComandas}>
                            <Text style={{ color: '#fff' }}>Apagar</Text>
                        </TouchableOpacity>

                        <FlatList
                            data={comandasPagas}
                            keyExtractor={(item, index) => index.toString()}
                            scrollEnabled={false} // importante para evitar conflito com ScrollView
                            renderItem={({ item }) => (
                                <View style={styles.item}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <FlatList
                                        data={item.items}
                                        keyExtractor={(subItem, subIndex) => subIndex.toString()}
                                        scrollEnabled={false}
                                        renderItem={({ item: subItem }) => (
                                            <Text>{subItem.name} - R$ {subItem.price.toFixed(2)}</Text>
                                        )}
                                    />
                                    <View style={styles.divider} />
                                    <Text>Total: R$ {item.total.toFixed(2)}</Text>
                                </View>
                            )}
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

                        <TouchableOpacity style={styles.menuButton}>
                            <FontAwesome5
                                name="check-circle"
                                size={20}
                                color={pathname === '/comandasPagas' ? '#fff' : '#000'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuButton} onPress={goToOutrasComandas}>
                            <FontAwesome5
                                name="user-check"
                                size={20}
                                color={pathname === '/usuarios' ? '#fff' : '#000'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ComandasPagas;

const styles = StyleSheet.create({

    main: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },

    container: {
        padding: 20,
        backgroundColor: '#f5f5f5'
    },

    titulo: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    total: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00c355',
        marginBottom: 15,
        textAlign: 'center'
    },

    item: {
        backgroundColor: '#bdbdbd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    clearButton: {
        backgroundColor: 'dodgerblue',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 16,
    },

    divider: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        marginVertical: 10,
    },

    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'red',
        height: 60,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        borderTopLeftRadius: 15,
        backgroundColor: 'dodgerblue',
        borderTopRightRadius: 15
    },

    menuButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        width: '30%'
    },
});
