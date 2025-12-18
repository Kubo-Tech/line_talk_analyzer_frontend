import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | LINE流行語大賞 2025',
  description: 'LINE流行語大賞 2025のプライバシーポリシー・利用規約',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">プライバシーポリシー・利用規約</h1>

      {/* 5.0 重要事項 */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-red-600">重要事項（必須同意項目）</h2>
        <p className="mb-4">本サービスを利用する前に、以下の事項に同意する必要があります。</p>

        {/* 5.0.1 サービスの性質 */}
        <div className="mb-6">
          <h3 className="mb-3 text-xl font-bold">サービスの性質</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>
                本サービスは個人が開発した非公式ツールであり、LINE株式会社およびLINEヤフー株式会社とは一切関係がありません。
              </strong>
            </li>
            <li>LINEの公式サービスではなく、LINE社の承認・推奨を受けたものではありません。</li>
            <li>
              「LINE」の名称は、LINEアプリのトーク履歴を解析対象とすることを説明する目的でのみ使用しています。
            </li>
          </ul>
        </div>

        {/* 5.0.2 免責事項 */}
        <div className="mb-6">
          <h3 className="mb-3 text-xl font-bold">免責事項</h3>
          <p className="mb-3">本サービスの利用に関して、以下の点をご了承ください：</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>
                本サービスは「現状有姿」で提供され、明示・黙示を問わず、いかなる保証も行いません。
              </strong>
            </li>
            <li>
              本サービスの利用により生じた直接的・間接的な損害について、開発者は一切の責任を負いません。
            </li>
            <li>データの紛失、漏洩、破損等が発生した場合でも、開発者は責任を負いません。</li>
            <li>サービスの中断、終了、変更について、事前の通知なく行う場合があります。</li>
            <li>解析結果の正確性は保証されません。</li>
          </ul>
        </div>

        {/* 5.0.3 利用条件 */}
        <div className="mb-6">
          <h3 className="mb-3 text-xl font-bold">利用条件</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              上記の「サービスの性質」および「免責事項」に同意した場合のみ、本サービスを利用できます。
            </li>
            <li>
              <strong>同意しない場合は、本サービスを利用することはできません。</strong>
            </li>
            <li>未成年の方は、保護者の同意を得た上でご利用ください。</li>
          </ul>
        </div>
      </section>

      {/* 5.2 データの取り扱い */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">データの取り扱い</h2>

        {/* 5.2.1 サーバー側での処理 */}
        <div className="mb-6">
          <h3 className="mb-3 text-xl font-bold">サーバー側での処理</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">項目</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">ファイルの保存</td>
                  <td className="border border-gray-300 px-4 py-2">
                    ❌ しない（ディスクに書き込まない）
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">データベースへの保存</td>
                  <td className="border border-gray-300 px-4 py-2">❌ しない（DBを使用しない）</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">メモリ上での処理</td>
                  <td className="border border-gray-300 px-4 py-2">
                    ✅ 解析処理中のみ一時的に保持
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">解析後のデータ</td>
                  <td className="border border-gray-300 px-4 py-2">✅ 即座にメモリから破棄</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">アクセスログ</td>
                  <td className="border border-gray-300 px-4 py-2">
                    ✅ IPアドレス・時刻のみ記録（トーク内容は記録しない）
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">第三者への提供</td>
                  <td className="border border-gray-300 px-4 py-2">❌ 一切行わない</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5.2.2 通信の保護 */}
        <div className="mb-6">
          <h3 className="mb-3 text-xl font-bold">通信の保護</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>HTTPS（TLS 1.2以上）</strong> による暗号化通信
            </li>
            <li>ファイル内容は暗号化された状態で送信</li>
            <li>通信経路上での盗聴を防止</li>
          </ul>
        </div>

        {/* 5.2.3 フロントエンド側での処理 */}
        <div className="mb-6">
          <h3 className="mb-3 text-xl font-bold">フロントエンド側での処理</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">項目</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">LocalStorage</td>
                  <td className="border border-gray-300 px-4 py-2">❌ トーク内容を保存しない</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Cookie</td>
                  <td className="border border-gray-300 px-4 py-2">❌ トーク内容を保存しない</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">解析結果の保持</td>
                  <td className="border border-gray-300 px-4 py-2">
                    ✅ ブラウザのメモリ上のみ（ページ離脱で消去）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5.4 推奨事項 */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">推奨事項</h2>
        <p className="mb-4">より安心してご利用いただくために、以下を推奨します：</p>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-bold">
              1. プライベートブラウジング（シークレットモード）の使用
            </h3>
            <ul className="list-disc space-y-1 pl-6">
              <li>ブラウザの履歴に残らない</li>
              <li>セッション終了後、一時データが自動削除される</li>
              <li>共有端末での利用時に特に有効</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-bold">2. 解析後の操作</h3>
            <ul className="list-disc space-y-1 pl-6">
              <li>結果確認後、ブラウザのタブを閉じることでメモリ上のデータも消去</li>
              <li>必要に応じてブラウザの履歴を削除</li>
            </ul>
          </div>
        </div>
      </section>

      {/* データ処理の透明性 */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">データ処理の透明性</h2>
        <p className="mb-4">
          本サービスはオープンソースで開発されており、処理内容を誰でも確認できます。
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">リポジトリ</th>
                <th className="border border-gray-300 px-4 py-2 text-left">説明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  <a
                    href="https://github.com/Kubo-Tech/line_talk_analyzer_frontend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    line_talk_analyzer_frontend
                  </a>
                </td>
                <td className="border border-gray-300 px-4 py-2">フロントエンド</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  <a
                    href="https://github.com/Kubo-Tech/line_talk_analyzer_backend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    line_talk_analyzer_backend
                  </a>
                </td>
                <td className="border border-gray-300 px-4 py-2">バックエンド</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 戻るボタン */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-white transition-colors hover:bg-blue-700"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
