'''
exercicio while total compras
'''
preco = float(input('Digite o preço do produto: (ou -1 para finalizar): '))
total = 0

while preco != -1:
    total += preco
    preco = float(input('Digite o preço do produto: (ou -1 para finalizar): ')) 
print(f'--- Total da compra: R$ {total:.2f} ---')
