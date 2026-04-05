print ('---Calculo de conta de energia 2026---')

#entrada de dados
consumo = float(input('Digite seu consumo em kwh: '))

#Definição de tarifa
if consumo < 150: 
    tarifa = 0.75
elif consumo <=500:
    tarifa = 0.95
else:
    tarifa = 1.20

#Calculo do valor 
valor = consumo * tarifa

#aplicação da taxa minima 
if valor <45:
    valor_total = 45
else:
    valor_total = valor

#Saida detalhada
print ('\n--- Conta de energia ---')
print (f'Consumo: {consumo} kwh')
print (f'Tarifa aplicada: R$ {tarifa:.2f} por kwh')   
print (f'Valor calculado: R$ {valor:.2f}')
print (f'Valor total a pagar: R$ {valor_total:.2f}')