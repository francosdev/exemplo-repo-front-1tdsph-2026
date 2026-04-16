#Inicio <= fim -> imprimir os pares e quantidade de elementos
#Inicio > fim -> imprimir os ímpares e quantidade de elementos
#inicio = fim -> imprimir mensagem "IGUAIS!"
#incrementar permitir executar mais de uma vez o programa

while True:
    inicio = int(input('Inicio: '))
    fim = int(input('Fim: '))   

    if inicio == fim:
        print("IGUAIS!")
    elif inicio < fim:
        quantidade = 0
        while inicio <= fim:
            if inicio % 2 == 0:
                print(f'{inicio} é par!')
                quantidade += 1
            inicio += 1
        print(f'Quantidade de pares: {quantidade}')
    else:
        quantidade = 0
        while inicio >= fim:
            if inicio % 2 != 0:
                print(f'{inicio} é ímpar!')
                quantidade += 1
            inicio -= 1
        print(f'Quantidade de ímpares: {quantidade}')
    resposta = input('Deseja executar novamente? (S/N): ')
    if resposta != 'S':
        break
    