import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FDF8F4',
          fontFamily: 'Georgia, serif',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 8,
                background: '#6B1D2A',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: '#6B1D2A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
              },
              children: {
                type: 'span',
                props: {
                  style: { color: '#fff', fontSize: 40, fontWeight: 700 },
                  children: '60',
                },
              },
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 52, fontWeight: 700, color: '#2D1F1F', marginBottom: 8 },
              children: "You're Invited",
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 32, fontStyle: 'italic', color: '#6B1D2A', marginBottom: 32 },
              children: "Sethu's 60th Birthday Celebration",
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 22, color: '#6B5E5E', marginBottom: 8 },
              children: 'Thursday, November 26, 2026 at 10:00 AM',
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 20, color: '#9A8F8F', marginBottom: 36 },
              children: 'Jewish Community Center, Omaha, Nebraska',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                background: '#6B1D2A',
                color: '#fff',
                padding: '14px 40px',
                borderRadius: 100,
                fontSize: 18,
                fontWeight: 600,
                fontFamily: 'system-ui, sans-serif',
              },
              children: 'RSVP Now',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
    }
  )
}
