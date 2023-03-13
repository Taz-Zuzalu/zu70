import { GetServerSideProps } from "next"

import { FavoritedEventsDTO, ParticipantsDTO, UserDTO } from "../types"

import MyEventsComponent from "../components/MyEvent"

type Props = {
    pastEvents: ParticipantsDTO[]
    attendingEvents: ParticipantsDTO[]
    favoritesEvents: FavoritedEventsDTO[]
    user: UserDTO | undefined
}

export default function MyEvents({ pastEvents, attendingEvents, favoritesEvents, user }: Props) {
    return (
        <MyEventsComponent
            pastEvents={pastEvents}
            attendingEvents={attendingEvents}
            favoritesEvents={favoritesEvents}
            user={user}
        />
    )
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    try {
        const usersResult = await fetch(`http://localhost:3000/api/fetchUsers`)
        const participantsResult = await fetch(`http://localhost:3000/api/fetchParticipants`)
        const usersFavoriteEventsResult = await fetch(`http://localhost:3000/api/fetchFavoritedEvents`)

        const usersData: UserDTO[] = await usersResult.json()
        const participantsData: ParticipantsDTO[] = await participantsResult.json()
        const usersFavoriteData: FavoritedEventsDTO[] = await usersFavoriteEventsResult.json()

        // mocked user for now (fetching user 1 from db)
        // since we implement user authentication in the server side, we need to fetch user dinamically
        const userEvents = participantsData.filter((item) => item.user_id === 1)
        const favoritesEvents = usersFavoriteData.filter((item) => item.user_id === 1)
        const pastEvents = userEvents.filter((item) => {
            const todayDate = new Date().getTime()
            const eventDate = new Date(item.events.endDate).getTime()
            if (todayDate > eventDate) {
                return item
            }
        })
        const attendingEvents = userEvents.filter((item) => {
            const todayDate = new Date().getTime()
            const eventDate = new Date(item.events.endDate).getTime()
            if (todayDate < eventDate) {
                return item
            }
        })
        const userInfo = usersData.find((item) => item.id === 1)

        return {
            props: { pastEvents, attendingEvents, favoritesEvents, user: userInfo }
        }
    } catch (error) {
        res.statusCode = 404
        return {
            props: {}
        }
    }
}