letra = input('Digite uma letra: ')
contadora = 0
while letra != 'x':
    print('Você digitou a letra: ' + letra)
    contadora += 1
    letra = input('Digite uma letra: ') 
print(f'O número de letras digitadas foi:  {contadora}')
