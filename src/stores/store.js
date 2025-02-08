import { create } from 'zustand'

const useAuthStore = create(set => ({
	idInstance: localStorage.getItem('idInstance') || '',
	apiTokenInstance: localStorage.getItem('apiTokenInstance') || '',
	setCredentials: (idInstance, apiTokenInstance) => {
		localStorage.setItem('idInstance', idInstance)
		localStorage.setItem('apiTokenInstance', apiTokenInstance)
		set({ idInstance, apiTokenInstance })
	},
}))

export default useAuthStore