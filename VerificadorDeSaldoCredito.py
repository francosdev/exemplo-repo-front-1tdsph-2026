SaldoCredito = float(input("Digite o saldo de crédito: "))
ValorCompra = float(input("Digite o valor da compra: "))
while ValorCompra != -1:
    if ValorCompra <= SaldoCredito:
        print(f"Compra aprovada! saldo restante: R${SaldoCredito - ValorCompra:.2f}")
        SaldoCredito -= ValorCompra
    else:
        print(f"Saldo insuficiente para a compra saldo disponível: R${SaldoCredito:.2f}")
    ValorCompra = float(input("Digite o valor da compra (ou -1 para sair): "))      

print(f" --- Compra finalizada. Saldo final: R${SaldoCredito:.2f} ---\n  --- obrigado por usar nosso sistema de verificação de saldo de crédito! --- ")