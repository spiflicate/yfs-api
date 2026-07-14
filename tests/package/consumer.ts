import {
   OAuth1Client,
   type OAuth1Params,
   type OAuth2AuthorizationRequest,
   type RequestOptions,
   type RosterCoverageOptions,
   RosterMoveBuilder,
   type TeamKey,
   type TokenStorage,
   YahooFantasyClient,
   type YahooTeamResponseDto,
} from 'yfs-api';

type TransactionBuilderMustStayPrivate =
   Extract<
      keyof typeof import('yfs-api'),
      'TransactionBuilder'
   > extends never
      ? true
      : never;

const coverage: RosterCoverageOptions = { week: 1 };
const options: RequestOptions = { timeout: 1_000 };
const teamKey: TeamKey = '1.l.2.t.3';
const storage: TokenStorage | undefined = undefined;
const authRequest: OAuth2AuthorizationRequest | undefined = undefined;
const params: OAuth1Params | undefined = undefined;
const response: YahooTeamResponseDto | undefined = undefined;
const privateExportCheck: TransactionBuilderMustStayPrivate = true;

void [
   OAuth1Client,
   YahooFantasyClient,
   RosterMoveBuilder,
   coverage,
   options,
   teamKey,
   storage,
   authRequest,
   params,
   response,
   privateExportCheck,
];
