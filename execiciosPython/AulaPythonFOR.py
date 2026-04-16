texto = 'Olá, Python'
texto [0]
for letra in texto:    print(letra)

#lista
#heterogênea 

lista = 3, True, 3.14, 'Python'
for item in lista:
    print(item)

#tupla          
#heterogênea    
tupla = (1, 3.14, 'Python', False)
for item in tupla:
    print(item) 

#range (intervalo)
#homogênea e imutável
#range (inicio, fim, passo)
range (1,10,1)
range (1, 10)
list(range(1, 10))
for numero in range(1, 10):
    print(numero)
lista = list(range(1, 10))
print(lista)

for i in range(10):
    if i % 2 == 0:
        print(f'{i} é par')