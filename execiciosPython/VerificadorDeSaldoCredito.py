SaldoCredito = float(input("Digite o saldo de crédito: "))
ValorCompra = float(input("Digite o valor da compra: "))
total = 0

while SaldoCredito >= ValorCompra:
    SaldoCredito -= ValorCompra
    total += ValorCompra
    ValorCompra = float(input("Digite um valor de compra menor ou igual ao saldo de crédito: "))  

print(f" --- Compra finalizada. valor total da compra R$: {total:.2f}\n Saldo final: R${SaldoCredito:.2f} ---\n  --- obrigado por usar nosso sistema de verificação de saldo de crédito! --- ")