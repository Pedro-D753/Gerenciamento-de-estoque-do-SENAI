import smtplib
from email.message import EmailMessage
from sqlalchemy.orm import Session
from ..models.user import UserModel
from .user import criar_token
from .erros import ErroUserNaoEncontrado, ErroJwtInvalido, ErroJwtInvalidoEmail, ErroInesperado, AutStmpServer, StmpIndisponivel
from ..config import EMAIL_EMISOR, EMAIL_SENHA, DNS_RETORNO
from ..dependencies import verificar_jwt
from ..db.conection_redis import redis_conection 
from pathlib import Path

PATH_HTML = Path(__file__).resolve().parents[1] / "template" / "email_send.html"

async def enviar_email(email: str, session : Session)-> dict :
    try:
        query = session.query(UserModel).filter_by(email = email, is_ativo = True).first()

        if query is None : raise ErroUserNaoEncontrado(session)

        jwt = criar_token(id_user=int(query.id), is_reste_senha=True)

        URL = f"{DNS_RETORNO}/{jwt}"

        #montar o e-mail, estrutura basica
        msg = EmailMessage()
        
        #Assundo do email
        msg['Subject'] = "Resertar a Senha"

        #Quem tá Envidao o Email
        msg['From'] = f"Suporte <{EMAIL_EMISOR}>"

        #Para quem
        msg['To'] = query.email

        with open(PATH_HTML, 'r', encoding='utf-8') as arquivo:
            html = arquivo.read()

            html = html.format(user=str(query.nome), codigo=URL)

        
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

    except smtplib.SMTPAuthenticationError:
        raise AutStmpServer(session)

    except (smtplib.SMTPServerDisconnected,smtplib.SMTPConnectError):
        raise StmpIndisponivel(session)
    
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

