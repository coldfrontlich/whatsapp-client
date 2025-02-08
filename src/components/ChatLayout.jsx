import { useState, useEffect } from 'react'
import MyInput from './ui/MyInput'
import MyButton from './ui/MyButton'
import useAuthStore from '../stores/store'

const ChatLayout = () => {
	const { idInstance, apiTokenInstance } = useAuthStore()
	const [phoneNumber, setPhoneNumber] = useState('')
	const [selectedChat, setSelectedChat] = useState(null)
	const [chats, setChats] = useState([])
	const [messages, setMessages] = useState({})
	const [messageText, setMessageText] = useState('')

		useEffect(() => {
			const savedChats = JSON.parse(localStorage.getItem('chats')) || []
			setChats(savedChats)
		}, [])

		useEffect(() => {
			localStorage.setItem('chats', JSON.stringify(chats))
		}, [chats])

	const handleAddChat = () => {
		if (phoneNumber) {
			const formattedNumber = phoneNumber.replace(/\D/g, '')
			if (!chats.includes(formattedNumber)) {
				setChats([...chats, formattedNumber])
				setMessages(prev => ({ ...prev, [formattedNumber]: [] }))
			}
			setPhoneNumber('')
			setSelectedChat(formattedNumber)
		}
	}

	const handleSendMessage = async () => {
		if (!selectedChat || !messageText.trim()) return

		const apiUrl = `https://${idInstance.slice(
			0,
			4
		)}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`

		const payload = {
			chatId: `${selectedChat}@c.us`,
			message: messageText,
		}

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (response.ok) {
				const newMessage = { text: messageText, sender: 'me' }
				setMessages(prev => ({
					...prev,
					[selectedChat]: [...(prev[selectedChat] || []), newMessage],
				}))
				setMessageText('')
			} else {
				console.log('Ошибка отправки сообщения')
			}
		} catch (e) {
			console.log('Ошибка сети:', e)
		}
	}

	return (
		<div className='chat-container'>
			<div className='chat-list'>
				<h2>Ваши чаты</h2>
				<MyInput
					type='tel'
					placeholder='Введите номер (без +)'
					value={phoneNumber}
					onChange={e => setPhoneNumber(e.target.value)}
				/>
				<MyButton onClick={handleAddChat}>Добавить чат</MyButton>

				<ul className='chats'>
					{chats.map(chat => (
						<li
							className={`chats-item ${selectedChat === chat ? 'active' : ''}`}
							key={chat}
							onClick={() => setSelectedChat(chat)}
						>
							{chat}
						</li>
					))}
				</ul>
			</div>
			<div className='chat-window'>
				{selectedChat ? (
					<>
						<h2>Чат с +{selectedChat}</h2>
						<div className='messages'>
							{messages[selectedChat]?.map((msg, index) => (
								<div
									key={index}
									className={`message ${
										msg.sender === 'me' ? 'sent' : 'received'
									}`}
								>
									{msg.text}
								</div>
							))}
						</div>
						<div className='message-input'>
							<MyInput
								type='text'
								placeholder='Введите сообщение...'
								value={messageText}
								onChange={e => setMessageText(e.target.value)}
							/>
							<MyButton onClick={handleSendMessage}>Отправить</MyButton>
						</div>
					</>
				) : (
					<h2>Выберите чат</h2>
				)}
			</div>
		</div>
	)
}

export default ChatLayout
