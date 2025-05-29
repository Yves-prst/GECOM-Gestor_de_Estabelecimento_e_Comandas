import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { router } from 'expo-router';

const ComandasPagas = () => {
    const [comandasPagas, setComandasPagas] = useState([]);
    const [totalGeral, setTotalGeral] = useState(0);

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
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
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
        <View style={styles.container}>

            <Text onPress={() => router.back()} activeOpacity={0.8} style={{ color: '#000', fontSize: 20, }}>Voltar</Text>

            <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>Comandas Pagas</Text>

            <Text style={styles.total}>Total Geral: R$ {totalGeral.toFixed(2)}</Text>

            <TouchableOpacity style={styles.clearButton} onPress={zerarComandas}>
                <Text style={{ color: '#fff' }} >Apagar</Text>
            </TouchableOpacity>

            <FlatList
                data={comandasPagas}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.title}>{item.title}</Text>
                        <FlatList
                            data={item.items}
                            keyExtractor={(subItem, subIndex) => subIndex.toString()}
                            renderItem={({ item: subItem }) => (
                                <Text>{subItem.name} - R$ {subItem.price.toFixed(2)}</Text>
                            )}
                        />
                        <View style={styles.divider} />
                        <Text>Total: R$ {item.total.toFixed(2)}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default ComandasPagas;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    total: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00c355',
        marginBottom: 15,
        textAlign: 'center'
    },

    item: {
        backgroundColor: 'lightgray',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10
    },

    voltarButton: {
        width: 120,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 12,
        padding: 15
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
});
