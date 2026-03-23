import type { VercelRequest, VercelResponse } from '@vercel/node'

// ═══════════════════════════════════════════════════════════════════
// FretPractice Twitter Feed — Vercel Serverless Function
// 
// SETUP (one-time):
// 1. Go to https://developer.twitter.com/en/apps
// 2. Create a project + app, copy your Bearer Token
// 3. In Vercel dashboard → Settings → Environment Variables
//    Add: TWITTER_BEARER_TOKEN = your_token_here
// 4. In App.tsx set TWITTER_CONFIG.LIVE_MODE = true
// ═══════════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate') // cache 5 min

  const BEARER = process.env.TWITTER_BEARER_TOKEN
  if (!BEARER) {
    return res.status(500).json({ error: 'TWITTER_BEARER_TOKEN not set in environment variables' })
  }

  const headers = { Authorization: `Bearer ${BEARER}` }
  const tweetFields = 'tweet.fields=created_at,public_metrics'
  const expansions = 'expansions=author_id'
  const userFields = 'user.fields=name,username,profile_image_url'

  try {
    // 1. Get FretPractice user ID
    const userRes = await fetch(
      'https://api.twitter.com/2/users/by/username/FretPractice?user.fields=id',
      { headers }
    )
    const userData = await userRes.json()
    const userId = userData?.data?.id

    if (!userId) {
      return res.status(404).json({ error: 'FretPractice Twitter account not found' })
    }

    // 2. Fetch both in parallel: FretPractice timeline + founder mentions
    const [timelineRes, searchRes] = await Promise.all([
      fetch(
        `https://api.twitter.com/2/users/${userId}/tweets?max_results=6&${tweetFields}&${expansions}&${userFields}&exclude=retweets,replies`,
        { headers }
      ),
      fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=@FretPractice from:rivuchakraborty -is:retweet&max_results=6&${tweetFields}&${expansions}&${userFields}`,
        { headers }
      )
    ])

    const [timeline, search] = await Promise.all([timelineRes.json(), searchRes.json()])

    const shape = (data: any, includes: any) => (data || []).map((t: any) => {
      const author = includes?.users?.find((u: any) => u.id === t.author_id)
      return {
        id: t.id,
        text: t.text,
        date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        likes: t.public_metrics?.like_count || 0,
        retweets: t.public_metrics?.retweet_count || 0,
        author: author?.name || 'FretPractice',
        handle: `@${author?.username || 'FretPractice'}`,
        avatar: author?.profile_image_url?.replace('_normal', '_400x400') || '',
      }
    })

    const all = [
      ...shape(timeline.data, timeline.includes),
      ...shape(search.data, search.includes),
    ]
      .sort((a, b) => b.id.localeCompare(a.id)) // newest first
      .slice(0, 6)

    return res.status(200).json(all)

  } catch (err) {
    console.error('Twitter API error:', err)
    return res.status(500).json({ error: 'Failed to fetch tweets' })
  }
}
