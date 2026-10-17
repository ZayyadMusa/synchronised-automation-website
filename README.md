# Synchronised Automation

A corporate website for smart home automation, security, network engineering and renewable energy. Includes service browsing, technology brands, a client gallery, project enquiry planning and an interactive home experience.

**Live website:** [ss-ng.com](https://ss-ng.com/)

## Development

Use Node 22.13 or newer. Run `npm install`, `npm run dev`, `npm run check` and `npm run build`. Start the production server with `npm start`.

## Deploy

Import the repository into Vercel as a Next.js project. No private platform configuration or application secrets are required by the front end.

## Content and enquiries

Company details are in `lib/company.ts`; page source is in `app/`; shared interface and scene components are in `components/`. Photos, video, brand marks and fonts are bundled in `public/`. The enquiry flow prepares contact details for the available email/phone channels. The home experience is an interactive simulation and does not control installed equipment.

Included font and vendor licences remain alongside their assets. Brand names and logos belong to their respective owners.
