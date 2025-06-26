import React, { useState, useEffect } from 'react';

import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, StatusBar, Keyboard, Platform
} from 'react-native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { usePathname } from 'expo-router';


export default function App() {

  function goToComandasPagas() {
    router.navigate("./comandasPagas")
  }

  function goToOutrasComandas() {
    router.navigate("./comandasOutros")
  }

  const [productCode, setProductCode] = useState(''); // Código do produto digitado
  const [currentComanda, setCurrentComanda] = useState([]); // Produtos da comanda atual
  const [comandas, setComandas] = useState([]); // Histórico de comandas
  const [numeroComanda, setNumeroComanda] = useState(1); // Número da comanda atual
  const [comandaEditadaIndex, setComandaEditadaIndex] = useState(null);
  const [showAdicionais, setShowAdicionais] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedAdicionais, setSelectedAdicionais] = useState([]);
  const [adicionaisAtuais, setAdicionaisAtuais] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const pathname = usePathname();



  const productsData = {
    0: { name: "Tapioca de Carne seca", price: 19.50 },
    1: { name: "Tapioca de Calabresa", price: 11.50 },
    2: { name: "Tapioca de Carne Bovina Gourmet", price: 14.50 },
    3: { name: "Tapioca Especial", price: 14.50 },
    4: { name: "Tapioca de Frango", price: 10.50 },
    5: { name: "Tapioca de Frango c/ Catupiry", price: 12.50 },
    6: { name: "Tapioca de Frango c/ Cheddar", price: 12.50 },
    7: { name: "Tapioca de Frango c/ Batata Doce", price: 11.50 },
    8: { name: "Tapioca de Pizza", price: 11 },
    9: { name: "Tapiproteica", price: 16.50 },
    10: { name: "Tapiegg", price: 10.50 },
    11: { name: "Tapifitness", price: 11.50 },
    12: { name: "Tapioca de Banana c/ Canela", price: 10.50 },
    13: { name: "Tapioca de Banana Fitness", price: 15 },
    14: { name: "Tapioca de Banana ao Mel", price: 12 },
    15: { name: "Tapioca de Banana Gourmet", price: 12 },
    16: { name: "Tapioca de Coco", price: 11.50 },
    17: { name: "Tapioca da Casa", price: 14.50 },
    18: { name: "Tapioca de Morango", price: 12 },
    19: { name: "Tapioca de Doce de Abobóra c/ Creme de Ricota", price: 14 },
    20: { name: "Tapioca de Prestígio", price: 14.50 },
    21: { name: "Tapioca Romeu e Julieta", price: 10.50 },
    22: { name: "Copo 400ml", price: 7 },
    23: { name: "Copo 500ml", price: 8 },
    24: { name: "Garrafa 500ml", price: 10 },
    25: { name: "Garrafa 1l", price: 18 },
    26: { name: "Garrafa 2l", price: 28 },
    27: { name: "Suco Natural de Laranja", price: 13.50 },
    32: { name: "Tapioca de Carne Bovina Especial", price: 24.50 },
    33: { name: "Coco Verde Gelado", price: 10.50 },
    34: { name: "Garrafa Coco", price: 12 },
    35: { name: "Água Garrafa", price: 3 },
    36: { name: "Refrigerante em lata", price: 6 },
    37: { name: "Café Espresso Supremo Puro ou c/ Leite", price: 6 },
    38: { name: "Café Melitta Filtrado Puro ou c/ Leite", price: 6 },
    39: { name: "Chá Mate Quente Natural ou Sabores", price: 4 },
    40: { name: "Chocolatto Espresso Levemente Adocicado", price: 8.50 },
    41: { name: "Chocolate Nestlé 100% Cacau", price: 8 },
    42: { name: "Achocolatado Nescau", price: 5 },
    43: { name: "Geladinho de Abacate", price: 3.50 },
    44: { name: "Geladinho de Coco", price: 3.50 },
    45: { name: "Geladinho de Chocolate", price: 3.50 },
    46: { name: "Geladinho de Maracujá", price: 3.50 },
    47: { name: "Geladinho de Melancia", price: 3.50 },
    48: { name: "Geladinho de Morango", price: 3.50 },
    49: { name: "Geladinho de Paçoca", price: 3.50 },
    50: { name: "Amendoim Doce Cricri", price: 5 },
    51: { name: "Amendoim Salgado na Manteiga", price: 5 },
  }


  useEffect(() => {
    const loadComandas = async () => {
      try {
        const saved = await AsyncStorage.getItem('comandasAbertas');
        if (saved) {
          const parsed = JSON.parse(saved);
          setComandas(parsed);
          setNumeroComanda(parsed.length + 1);
        }
      } catch (e) {
        console.error('Erro ao carregar comandas', e);
      }
    };

    loadComandas();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Limpeza dos listeners ao desmontar
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const addProduct = () => {
    const code = parseInt(productCode);

    if (productsData[code]) {
      const product = {
        code,
        name: productsData[code].name,
        price: productsData[code].price,
      };

      setCurrentComanda([...currentComanda, product]);
      setProductCode('');
    } else {
      Alert.alert('Erro', 'Código de produto inválido.');
    }
  };

  const confirmComanda = async () => {
    if (currentComanda.length === 0) {
      Alert.alert('Erro', 'Comanda vazia!');
      return;
    }

    const total = currentComanda.reduce((sum, item) => sum + item.price, 0);
    const novaComanda = {
      title: `Comanda ${comandaEditadaIndex !== null ? comandaEditadaIndex + 1 : numeroComanda}`,
      items: currentComanda,
      total,
    };

    let novasComandas;

    if (comandaEditadaIndex !== null) {
      novasComandas = [...comandas];
      novasComandas[comandaEditadaIndex] = novaComanda;
      setComandaEditadaIndex(null);
    } else {
      novasComandas = [...comandas, novaComanda];
      setNumeroComanda(numeroComanda + 1);
    }

    setComandas(novasComandas);
    setCurrentComanda([]);

    try {
      await AsyncStorage.setItem('comandasAbertas', JSON.stringify(novasComandas));
    } catch (e) {
      console.error('Erro ao salvar comanda', e);
    }
    setShowAdicionais(false);
  };


  const editarComanda = (index) => {
    const comandaSelecionada = comandas[index];
    setCurrentComanda(comandaSelecionada.items);
    setComandaEditadaIndex(index);
  };



  const deleteLinha = (indexToRemove) => {
    const novaLista = currentComanda.filter((_, index) => index !== indexToRemove);
    setCurrentComanda(novaLista);
  };

  const clearComandas = async () => {

    try {
      await AsyncStorage.clear();
      setComandas([]);
      setNumeroComanda(1);
      Alert.alert('Comandas Limpa', 'O histórico de comandas foi limpo.');

    } catch (e) {
      console.error('Erro ao limpar o AsyncStorage', e);
    }

  };

  const enviarItem = async (index) => {
    try {
      const itemSelecionado = comandas[index];

      // Carrega as comandas pagas existentes
      const pagas = await AsyncStorage.getItem('comandasPagas');
      const comandasPagas = pagas ? JSON.parse(pagas) : [];

      // Adiciona a comanda como paga
      const atualizadasPagas = [...comandasPagas, itemSelecionado];
      await AsyncStorage.setItem('comandasPagas', JSON.stringify(atualizadasPagas));

      // Remove da lista de abertas
      const novasComandasAbertas = comandas.filter((_, i) => i !== index);
      setComandas(novasComandasAbertas);
      await AsyncStorage.setItem('comandasAbertas', JSON.stringify(novasComandasAbertas));
    } catch (e) {
      console.error('Erro ao enviar comanda:', e);
    }
  };

  const excluirComanda = async (idx) => {
    Alert.alert(
      "Excluir Comanda",
      "Você tem certeza que deseja excluir esta comanda?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            const atualizadas = comandas.filter((_, i) => i !== idx);
            setComandas(atualizadas);
            try {
              await AsyncStorage.setItem('comandasAbertas', JSON.stringify(atualizadas));
            } catch (e) {
              console.error('Erro ao excluir comanda', e);
            }
          }
        }
      ]
    );
  };

  const adicionaisDisponiveis = [
    { name: "+ Cheddar", price: 3 },
    { name: "+ Catupiry", price: 3 },
    { name: "+ Muçarela", price: 3 },
    { name: "+ Carne Bovina", price: 4 },
    { name: "+ Ovo", price: 3 },
    { name: "+ Morango", price: 3 },
    { name: "+ Chocolate", price: 3 },
    { name: "+ Coco", price: 3 },
    { name: "+ Leite Condensado", price: 3 },
    { name: "+ Goiabada", price: 3 },
    { name: "+ Tomate", price: 3 },
    { name: "+ Banana", price: 3 },
    { name: "+ Mel", price: 3 },
    { name: "+ Frango", price: 4 },
    { name: "+ Canela", price: 0 },
    { name: "+ Carne Seca", price: 5 },
    { name: "Sem Cebola", price: 0 },
    { name: "Sem Tomate", price: 0 },
    { name: "Sem orégano", price: 0 },
    { name: "Sem orapronóbis", price: 0 },
    { name: "Para Viagem", price: 0 }
  ];

  const sabores = [
    { name: "Limão", price: 0 },
    { name: "Abacaxi", price: 0 },
    { name: "Gengibre", price: 0 },
    { name: "Maracujá", price: 0 },
    { name: "Sem Gelo", price: 0 }

  ]

  const abrirAdicionais = (index) => {
    const nome = currentComanda[index].name.toLowerCase();

    // Verifica se o nome contém "copo" ou "garrafa"
    if (nome.includes('copo') || nome.includes('garrafa')) {
      setAdicionaisAtuais(sabores); // usa a lista de sabores
    } else {
      setAdicionaisAtuais(adicionaisDisponiveis); // usa adicionais padrão
    }

    setSelectedItemIndex(index);
    setSelectedAdicionais([]);
    setShowAdicionais(true);
  };


  const closeAdicionais = () => {
    setShowAdicionais(false);
  }

  const toggleAdicional = (adicional) => {
    const jaSelecionado = selectedAdicionais.find(a => a.name === adicional.name);
    if (jaSelecionado) {
      setSelectedAdicionais(prev => prev.filter(a => a.name !== adicional.name));
    } else {
      setSelectedAdicionais(prev => [...prev, adicional]);
    }
  };

  const confirmarAdicionais = () => {
    const novosItens = [...currentComanda];
    const itemOriginal = novosItens[selectedItemIndex];

    const adicionaisTexto = selectedAdicionais.map(a => a.name).join(', ');
    const totalAdicional = selectedAdicionais.reduce((sum, a) => sum + a.price, 0);

    itemOriginal.name += ` (${adicionaisTexto})`;
    itemOriginal.price += totalAdicional;

    setCurrentComanda(novosItens);
    setShowAdicionais(false);
  };


  return (
    <View style={styles.main}>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <StatusBar
          barStyle="light-content" // ou "dark-content"
          backgroundColor="#000" // cor de fundo da status bar (Android)
        />

        <Text style={styles.title}>Comandas</Text>

        <View style={styles.adicionado}>

          {currentComanda.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.textoContainer}>
                <Text style={styles.textoProduto}>
                  {item.name} - R${item.price.toFixed(2)}
                </Text>
              </View>

              <View style={styles.botoesContainer}>
                <TouchableOpacity style={styles.buttonAdd} onPress={() => abrirAdicionais(index)}>
                  <FontAwesome name="plus" size={24} color="green" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonAdd} onPress={() => deleteLinha(index)}>
                  <FontAwesome name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>

          ))}

          {showAdicionais && (
            <View style={styles.modalContainer}>

              <View style={styles.addTop}>

                <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>
                  Selecione Adicionais
                </Text>

                <TouchableOpacity style={styles.buttonAdd} onPress={() => closeAdicionais()}>
                  <FontAwesome name="close" size={24} color="black" />
                </TouchableOpacity>

              </View>


              <View style={{ maxHeight: 200 }}> {/* altura máxima da lista */}
                <ScrollView>
                  {adicionaisAtuais.map((ad, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.adicionalOption}
                      onPress={() => toggleAdicional(ad)}
                    >
                      <Text style={{ color: selectedAdicionais.find(a => a.name === ad.name) ? 'blue' : 'black', marginBottom: 2, marginTop: 5 }}>
                        {ad.name} (+R${ad.price.toFixed(2)})
                      </Text>
                    </TouchableOpacity>
                  ))}

                </ScrollView>
              </View>

              <TouchableOpacity onPress={confirmarAdicionais} style={styles.confirmAdicionalButton}>
                <Text style={styles.confirmExtras}>Confirmar</Text>
              </TouchableOpacity>
            </View>

          )}

        </View>

        <View style={styles.inputRow}>

          <TextInput

            style={styles.input}
            placeholder="Código do Produto"
            keyboardType="numeric"
            value={productCode}
            onChangeText={setProductCode}

          />

          <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={addProduct}>

            <Text>Adicionar</Text>

          </TouchableOpacity>

        </View>

        <View style={styles.buttons}>

          <TouchableOpacity activeOpacity={0.8} style={styles.confirmButton} onPress={confirmComanda}>

            <Text style={{ color: '#fff' }}>Confirmar Comanda</Text>

          </TouchableOpacity>

        </View>

        <View style={styles.historico}>

          {comandas.map((cmd, idx) => (

            <View key={idx} style={styles.comandaBox}>

              <View style={styles.menuIcons}>

                <TouchableOpacity style={styles.buttonMenu}>
                  <FontAwesome5 name="print" size={20} color="black" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonMenu} onPress={() => editarComanda(idx)}>
                  <FontAwesome5 name="pen" size={20} color="black" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonMenu} onPress={() => enviarItem(idx)}>
                  <FontAwesome5 name="check" size={20} color="black" regular />
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonMenu} onPress={() => excluirComanda(idx)}>
                  <FontAwesome5 name="trash" size={20} color="black" regular />
                </TouchableOpacity>

              </View>

              <Text style={styles.comandaTitle}>{cmd.title}</Text>

              {cmd.items.map((item, i) => (
                <Text key={i}>- {item.name} (R${item.price.toFixed(2)})</Text>
              ))}

              <View style={styles.divider} />

              <Text style={{ fontWeight: 'bold' }}>Total: R${cmd.total.toFixed(2)}</Text>

            </View>
          ))}

        </View>

      </ScrollView>

      {!keyboardVisible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuButton} >
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

          <TouchableOpacity style={styles.menuButton} onPress={goToOutrasComandas}>
            <FontAwesome5
              name="user-check"
              size={20}
              color={pathname === '/usuarios' ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>
      )}

    </View>

  );
}

const styles = StyleSheet.create({

  main: {
    flex: 1,

  },

  container: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    height: '85%'
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },

  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10, flex: 1,
    borderRadius: 5,
    color: 'black',
  },

  button: {
    backgroundColor: '#bdbdbd',
    padding: 10,
    borderRadius: 5
  },

  adicionado: {
    marginVertical: 10,
  },

  item: {
    backgroundColor: '#bdbdbd',
    padding: 5,
    marginBottom: 5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  buttons: {
    flex: 1,
    gap: 10,
  },

  modalContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 10,
    zIndex: 10,
    marginTop: 10,
    marginBottom: 10,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 10,

  },

  textoContainer: {
    flex: 1,
  },

  textoProduto: {
    flexWrap: 'wrap',
  },

  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },

  addTop: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    alignItems: 'center'
  },

  confirmExtras: {
    backgroundColor: '#bdbdbd',
    color: 'black',
    borderRadius: 5,
    padding: 15,
    textAlign: 'center',
    marginTop: 10,
    width: '100%',

  },

  confirmButton: {
    backgroundColor: 'dodgerblue',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },

  historico: {
    marginTop: 20,
    marginBottom: 30,
  },

  comandaBox: {
    backgroundColor: '#bdbdbd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10
  },

  comandaTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  },

  menuIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,

  },

  buttonMenu: {
    width: '20%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonAdd: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    gap: 5
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