import type { NextPage } from "next";
import Link from "next/link";
import { Temporal } from "@js-temporal/polyfill";

import Twitter from "../../icons/twitter.svg";
import Github from "../../icons/github.svg";
import Discord from "../../icons/discord.svg";
import Youtube from "../../icons/youtube.svg";

import {
  footerNav,
  discordInviteUrl,
  githubUrl,
  twitterUrl,
  youtubeUrl,
} from "../../config/site_settings";

const navigation = {
  main: footerNav,
  social: [
    {
      name: "Twitter",
      href: twitterUrl,
      icon: Twitter,
    },
    {
      name: "GitHub",
      href: githubUrl,
      icon: Github,
    },
    {
      name: "Discord",
      href: discordInviteUrl,
      icon: Discord,
    },
    {
      name: "Youtube",
      href: youtubeUrl,
      icon: Youtube,
    },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-black">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav
          className="-mx-5 -my-2 flex flex-wrap justify-center"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              {item.href.includes("http") ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-gray-500 hover:text-gray-400"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  className="text-base text-gray-500 hover:text-gray-400"
                  href={item.href}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-8">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-base text-gray-500">
          &copy; {Temporal.Now.plainDateISO().year} Codú Software Solutions,
          Ltd.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
