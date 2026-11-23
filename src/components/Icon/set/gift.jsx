const gift = ({
  width, height, style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="138 92 400 404"
    width={width || '24'}
    height={height || '24'}
    style={style}
    fill="none"
  >
    <defs>
      <g id="gift-loop">
        <path
          fill="#FAE076"
          fillRule="evenodd"
          d="M312 182 C260 178 178 165 176 124 C175 96 230 92 272 124 C294 141 308 160 312 182 Z M296 172 C258 168 214 160 212 138 C211 120 246 122 272 144 C284 154 292 163 296 172 Z"
        />
        <path
          fill="#F2C14A"
          fillRule="evenodd"
          d="M304 178 C262 174 204 164 202 136 C201 112 248 116 278 140 C292 152 300 165 304 178 Z M296 172 C258 168 214 160 212 138 C211 120 246 122 272 144 C284 154 292 163 296 172 Z"
        />
      </g>
      <g id="gift-tail">
        <path fill="#B8253F" opacity="0.5" d="M306 196 C272 204 246 228 238 278 L226 262 L232 228 C250 205 278 192 306 190 Z" />
        <path fill="#F2C14A" d="M310 182 C268 186 224 208 216 268 L228 254 L240 274 C246 228 272 204 312 196 Z" />
        <path fill="#FAE076" d="M310 182 C270 186 230 206 220 262 L228 254 L236 266 C244 224 270 200 312 192 Z" />
      </g>
    </defs>

    <path fill="#EB3A4E" d="M174 236 H502 V476 Q502 492 486 492 H190 Q174 492 174 476 Z" />
    <path fill="#CE2E4B" d="M402 236 C472 262 482 344 432 410 C392 464 322 488 250 492 H486 Q502 492 502 476 V236 Z" />
    <rect x="174" y="236" width="328" height="16" fill="#C3283F" opacity="0.7" />

    <rect x="302" y="236" width="72" height="256" fill="#FAE076" />
    <path fill="#F2C14A" d="M374 400 C352 440 330 468 302 482 V492 H374 Z" />
    <rect x="302" y="236" width="72" height="16" fill="#F2C14A" />

    <rect x="142" y="180" width="392" height="56" rx="14" fill="#EB3A4E" />
    <path fill="#CE2E4B" d="M438 180 H520 Q534 180 534 194 V222 Q534 236 520 236 H500 C500 206 482 184 438 180 Z" />

    <use href="#gift-loop" />
    <use href="#gift-loop" transform="translate(676 0) scale(-1 1)" />

    <rect x="290" y="180" width="96" height="56" fill="#FAE076" />

    <use href="#gift-tail" />
    <use href="#gift-tail" transform="translate(676 0) scale(-1 1)" />

    <rect x="314" y="148" width="48" height="36" rx="14" fill="#EB3A4E" />
    <path fill="#CE2E4B" d="M340 148 H348 Q362 148 362 162 V184 H346 C352 172 350 158 340 148 Z" />
  </svg>
);

export default gift;
