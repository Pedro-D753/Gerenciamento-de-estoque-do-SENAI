import smtplib
from email.message import EmailMessage
from sqlalchemy.orm import Session
from ..models.user import UserModel
from .user import criar_token
from .erros import ErroUserNaoEncontrado, ErroJwtInvalido, ErroJwtInvalidoEmail, ErroInesperado
from ..config import EMAIL_EMISOR, EMAIL_SENHA, DNS_RETORNO
from ..dependencies import verificar_jwt
from ..db.conection_redis import redis_conection 


async def enviar_email(email: str, session : Session)-> dict :
    try:
        query = session.query(UserModel).filter_by(email = email, is_ativo = True).first()

        if query is None : raise ErroUserNaoEncontrado(session)

        jwt = criar_token(id_user=int(query.id), is_reste_senha=True)

        #montar o e-mail, estrutura basica
        msg = EmailMessage()
        
        #Assundo do email
        msg['Subject'] = "Resertar a Senha"

        #Quem tá Envidao o Email
        msg['From'] = f"Suporte <{EMAIL_EMISOR}>"

        #Para quem
        msg['To'] = query.email

        #html
        html =  f"""<!DOCTYPE html>  \n
        <head> \n
            <meta charset="UTF-8">\n
        </head>\n
        <body style="font-family: Arial, sans-serif; padding: 20px; \n
            background: #ffffff,\n
            ; color: #3b82f6; width: 100%; height: 300px;">\n
            <h1>Olá, {query.nome} !</h1>\n
            <p>Aqui está o linck para Redefinir a senha: </p>\n
            <div style="background-color: #ffffffa2; text-align: center; padding:1px ;border-radius: 5px;">\n
                <h3 style="color: #3b82f6; font-size: 24px;">\n
                    <a href="{DNS_RETORNO+"\\"+jwt}">click-me</a></h3>\n
            </div>\n
            <p>Esse email foi gerado altomaticamente. Não o responda.\n
                Atenciosamente,\n
            <br>Equipe do Suporte Senai Taguatinga.</p>\n
        </body>\n
        </html>
        """
        
        #email mesagem, necesse caso um arquivo html
        msg.set_content(html, subtype='html')

        #aqui é para caso ocorra um erro .
            # conectar ao servidor SMTP do Gmail
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            #loga na conta
            smtp.login(str(EMAIL_EMISOR), str(EMAIL_SENHA)) 
            #enviar e-mail
            smtp.send_message(msg) 
        
        return{'mensagem':"E-mail enviado"}
    
    except(ErroUserNaoEncontrado): raise

    #except smtplib.SMTPAuthenticationError:
    #    raise AutStmpServer(session)

    #except (smtplib.SMTPServerDisconnected,smtplib.SMTPConnectError):
    #    raise StmpIndisponivel(session)
    
    except Exception as e:
        raise ErroInesperado(EMAIL_EMISOR, session) # type: ignore

def verificar_email_senha(token: str, senha: str ,session: Session)-> dict:
    try:
        id, _ , is_rest_senha, jit = verificar_jwt(token)

        if is_rest_senha == False: 
            raise ErroJwtInvalidoEmail(session)
        
        if redis_conection.exists(f"usado:{jit}"): 
            raise ErroJwtInvalidoEmail(session)

        #add ele no redis para o mesmo token não poder ser usado por 15 minutos
        redis_conection.setex(f"usado:{jit}", 900, "true")
       
        query = session.query(UserModel).filter_by(id = id, is_ativo = True).first()
        
        if query is None: 
            raise ErroUserNaoEncontrado(session)
        
        query.novaSenha(senha)       
        session.commit()

        return {'mensagem':"Senha Alterada"}
    
    except (ErroJwtInvalidoEmail, ErroUserNaoEncontrado, ErroJwtInvalido): raise 

    except Exception as e: 
        raise ErroInesperado(e, session)

