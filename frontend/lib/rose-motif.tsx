export function RoseMotif({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.3"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <g transform="translate(-0.06641901,1.9261514)">
        <g transform="matrix(2.45,0,0,2.45,-17.4,-7.6)">
          <defs>
            <rect
              id="rr1"
              x="12.02"
              y="10.990834"
              width="0.3"
              height="10.067573"
              rx="0.15"
            />
            <path
              id="rp6"
              d="M 11.916195,16.581542 C 12.015155,15.049667 11.53552,13.79531 10.495694,13.195998 9.455867,12.596684 8.2512521,12.544101 7.3671663,12.94781 c -0.2217872,1.021426 0.1428017,2.290294 1.0390839,3.141466 0.8638926,0.82604 2.1081528,0.961279 3.5099448,0.492266 z"
            />
            <path
              id="rp7"
              d="m 12.132358,17.399214 c -0.09896,-1.531875 0.380675,-2.786232 1.420501,-3.385544 1.039827,-0.599314 2.244442,-0.651897 3.128528,-0.248188 0.221787,1.021426 -0.142802,2.290294 -1.039084,3.141466 -0.863893,0.82604 -2.108153,0.961279 -3.509945,0.492266 z"
            />
            <path
              id="rp1"
              d="M 12.023309,3.2777606 C 10.326601,4.4271433 9.3961484,5.9596535 9.6150784,7.5468962 9.8340084,9.1341389 10.764461,10.447719 11.913843,11.049776 13.172692,10.447719 14.212609,9.0246739 14.376806,7.3826987 14.541004,5.795456 13.665284,4.3724108 12.023309,3.2777606 Z"
            />
            <path
              id="rp2"
              d="m 14.179888,3.9197743 c -1.570785,0.4998148 -2.66828,1.5846509 -2.919768,3.0797712 -0.251489,1.4951202 0.10122,2.9678577 0.803996,3.8699815 1.099815,-0.145534 2.250598,-1.0976118 2.803186,-2.5215491 0.538265,-1.3747536 0.25517,-2.9286642 -0.687414,-4.4282036 z"
            />
            <path
              id="rp3"
              d="M 9.8689107,3.8959111 C 11.439696,4.3957259 12.537191,5.480562 12.788679,6.9756823 13.040168,8.4708025 12.687459,9.9435402 11.984683,10.845664 10.884868,10.70013 9.7340847,9.7480532 9.1814967,8.3241147 8.6432317,6.9493611 8.9263267,5.3954505 9.8689107,3.8959111 Z"
            />
            <path
              id="rp4"
              d="m 16.741858,4.6509614 c -2.047634,-0.084246 -3.798233,0.7518054 -4.56565,2.1583415 -0.767414,1.4065359 -0.799977,3.0159393 -0.233559,4.1832931 1.370188,0.264117 3.052322,-0.262107 4.160367,-1.4849228 1.075512,-1.1788018 -1.133824,-2.7914538 0.638842,-4.8567118 z"
            />
            <path
              id="rp5"
              d="m 7.2847603,4.6509614 c 2.0476328,-0.084246 3.7982317,0.7518054 4.5656487,2.1583415 0.767414,1.4065359 0.799978,3.0159393 0.233559,4.1832931 C 10.71378,11.256713 9.0316467,10.730489 7.9236013,9.5076732 6.848089,8.3288714 9.0574257,6.7162194 7.2847603,4.6509614 Z"
            />

            {/* stem mask: hidden under bud */}
            <mask id="rm_stem" maskUnits="userSpaceOnUse">
              <rect x="-20" y="-20" width="80" height="80" fill="white" />
              <use href="#rp1" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp2" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp3" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp4" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp5" stroke="black" strokeWidth="0.6" fill="black" />
            </mask>

            {/* leaf masks: cut out stem+border, mask each other, masked by bud */}
            <mask id="rm6" maskUnits="userSpaceOnUse">
              <rect x="-20" y="-20" width="80" height="80" fill="white" />
              <use href="#rr1" stroke="black" strokeWidth="0.3" fill="black" />
              <use href="#rp7" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp1" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp2" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp3" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp4" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp5" stroke="black" strokeWidth="0.6" fill="black" />
            </mask>

            <mask id="rm7" maskUnits="userSpaceOnUse">
              <rect x="-20" y="-20" width="80" height="80" fill="white" />
              <use href="#rr1" stroke="black" strokeWidth="0.3" fill="black" />
              <use href="#rp1" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp2" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp3" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp4" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp5" stroke="black" strokeWidth="0.6" fill="black" />
            </mask>

            {/* petal masks */}
            <mask id="rm1" maskUnits="userSpaceOnUse">
              <rect x="-20" y="-20" width="80" height="80" fill="white" />
              <use href="#rp2" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp3" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp4" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp5" stroke="black" strokeWidth="0.6" fill="black" />
            </mask>

            <mask id="rm2" maskUnits="userSpaceOnUse">
              <rect x="-20" y="-20" width="80" height="80" fill="white" />
              <use href="#rp3" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp4" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp5" stroke="black" strokeWidth="0.6" fill="black" />
            </mask>

            <mask id="rm3" maskUnits="userSpaceOnUse">
              <rect x="-20" y="-20" width="80" height="80" fill="white" />
              <use href="#rp4" stroke="black" strokeWidth="0.6" fill="black" />
              <use href="#rp5" stroke="black" strokeWidth="0.6" fill="black" />
            </mask>

            <mask id="rm4" maskUnits="userSpaceOnUse">
              <rect x="-20" y="-20" width="80" height="80" fill="white" />
              <use href="#rp5" stroke="black" strokeWidth="0.6" fill="black" />
            </mask>
          </defs>

          {/* stem — solid, under bud, no mask from leaves */}
          <use href="#rr1" mask="url(#rm_stem)" fill="currentColor" stroke="none" />

          {/* leaves — cut around stem+border, masked by each other and bud */}
          <use href="#rp6" mask="url(#rm6)" />
          <use href="#rp7" mask="url(#rm7)" />

          {/* bud */}
          <use href="#rp1" mask="url(#rm1)" />
          <use href="#rp2" mask="url(#rm2)" />
          <use href="#rp3" mask="url(#rm3)" />
          <use href="#rp4" mask="url(#rm4)" />
          <use href="#rp5" />
        </g>
      </g>
    </svg>
  )
}
