import { View, Text } from 'dripsy'

import { useSession } from '@/components/SessionProvider'

import Account from '@/components/Account'

export default function ManageAccount() {
    const session = useSession()


    return (
        <View sx={{ flex: 1, backgroundColor: '$background', p: 's' }}>
            <Account session={session.session} />

        </View>
    )
}