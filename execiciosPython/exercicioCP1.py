#exercio 1 - CP1

#entrada de dados
nome = input("Digite o nome  do vendedor:  ")
salario_fixo = float(input("Digite o salário fixo do vendedor:  "))
total_vendas = float(input("Digite o total de vendas do vendedor:  "))

print('Qual foi o periodo de vendas?')
print('1 segunda-feira a quarta-feira')
print('2 quinta-feira e sexta-feira')
print('3 sábado e domingo')

opcao = int(input("Digite a opção correspondente ao periodo de vendas:  "))

#testes condicionais para calcular a comissão
if opcao == 1:
    comissao = total_vendas * 0.20
elif opcao == 2:
    comissao = total_vendas * 0.15
elif opcao == 3:    
    comissao = total_vendas * 0.10
else: 
    print("Opção inválida. A comissão será calculada como 0.")

#calculo do salário total
salario_total = salario_fixo + comissao
print (f'\nVendedor: {nome}')
print(f'Salário Fixo: R$ {salario_fixo:.2f}')
print(f'Comissão: R$ {comissao:.2f}')   
print(f'Salário Total: R$ {salario_total:.2f}')   