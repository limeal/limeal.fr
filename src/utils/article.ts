import { getProfiles } from "@/firebase/store/profile"

export const sendEmailNewArticle = async (name: string, slug: string) => {
    const profiles = await getProfiles()
    console.log(profiles)
    const recipients = profiles.map(profile => profile.email).join(",")
    console.log(recipients)

    await fetch("/api/send-mail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type: "new-article",
            to: recipients,
            name,
            slug,
        }),
    })
}