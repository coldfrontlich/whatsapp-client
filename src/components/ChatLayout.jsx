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
		const savedMessages = JSON.parse(localStorage.getItem('messages')) || {}
		setChats([...new Set(savedChats)])
		setMessages(savedMessages)
	}, [])

	useEffect(() => {
		localStorage.setItem('chats', JSON.stringify([...new Set(chats)]))
	}, [chats])

	useEffect(() => {
		localStorage.setItem('messages', JSON.stringify(messages))
	}, [messages])

	const handleAddChat = () => {
		if (phoneNumber) {
			const formattedNumber = phoneNumber.replace(/\D/g, '')
			if (!chats.includes(formattedNumber)) {
				const updatedChats = [...chats, formattedNumber]
				setChats(updatedChats)
				setMessages(prev => ({ ...prev, [formattedNumber]: [] }))
				localStorage.setItem('chats', JSON.stringify(updatedChats))
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
				console.log('Ошибка отправки')
			}
		} catch (e) {
			console.log(e)
		}
	}

	const fetchMessages = async () => {
		const apiUrl = `https://${idInstance.slice(
			0,
			4
		)}.api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`

		try {
			const response = await fetch(apiUrl)
			const data = await response.json()

			if (
				data &&
				data.body &&
				(data.body.typeWebhook === 'incomingMessageReceived' ||
					data.body.typeWebhook === 'outgoingMessageReceived')
			) {
				const sender = data.body.senderData.chatId.replace('@c.us', '')
				if (!chats.includes(sender)) {
					setChats(prev => [...new Set([...prev, sender])])
				}

				if (data.body.messageData && data.body.messageData.textMessageData) {
					const newMessage = {
						text: data.body.messageData.textMessageData.textMessage,
						sender: 'them',
					}

					setMessages(prev => ({
						...prev,
						[sender]: [...(prev[sender] || []), newMessage],
					}))
				}
			} 

			if (data && data.receiptId) {
				await fetch(
					`https://${idInstance.slice(
						0,
						4
					)}.api.green-api.com/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${
						data.receiptId
					}`,
					{ method: 'DELETE' }
				)
			}
		} catch (e) {
			console.e('Ошибка при получении сообщений:', e)
		}
	}

	useEffect(() => {
		const interval = setInterval(fetchMessages, 5000)
		return () => clearInterval(interval)
	}, [])

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
						<div>
							{' '}
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
