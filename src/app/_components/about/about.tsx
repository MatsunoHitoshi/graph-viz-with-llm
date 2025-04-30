"use client";

import Image from "next/image";
import { TopGraph } from "./top-graph";
import { useWindowSize } from "../../_hooks/use-window-size";
export const About = () => {
  const [innerWidth = 100] = useWindowSize();
  return (
    <div className="flex w-full flex-col text-white">
      <div className="absolute inset-0 z-0 w-full opacity-45">
        <TopGraph height={252 + 64} width={innerWidth} />
      </div>
      <div className="relative z-10 flex w-full flex-col items-center gap-2 py-20">
        <h1 className="text-4xl font-bold sm:text-6xl">ArsTraverse</h1>
        <p>関係性の宇宙を横断する可視化ツール</p>
      </div>

      <Section>
        <h2 className="text-2xl font-bold lg:text-3xl">
          芸術文化の文脈を可視化し、共に編集し、未来へアーカイブする
        </h2>
        <p className="container">
          ArsTraverseは、芸術文化に関わる研究者や学芸員の方々が、論文や書籍などの文献にある情報から、人や作品、アイデアなどの「つながり」（文脈）を見つけ出し、それを図で分かりやすく整理したり、自身の考えを書き加えたりしながら、知識を深め、みんなで共有・議論していくためのアーカイブツールです。
        </p>
      </Section>

      <Section className="bg-black/20">
        <h2 className="text-2xl font-bold lg:text-3xl">
          つながりを表現する「知識グラフ」とは？
        </h2>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex flex-col gap-4">
            <p className="container">
              ArsTraverseの核である知識グラフ技術は、一見複雑な情報や関係性を、
              「点（ノード）」 と 「線（エッジ）」
              で表現するデータのかたちです。例えば、{" "}
              <span className="text-orange-500">「作家A」</span> という点と{" "}
              <span className="text-orange-500">「作品X」</span>{" "}
              という点があり、その間を{" "}
              <span className="text-orange-500">「制作」</span>{" "}
              という線で結ぶことで、{" "}
              <span className="text-orange-500">
                「作家Aが作品Xを制作した」
              </span>{" "}
              という関係性を視覚的に分かりやすく表現できます。
            </p>
            <div className="flex flex-col items-center md:hidden">
              <Image
                src="/images/about/knowledge-graph.png"
                alt="知識グラフ"
                className="max-w-52"
                width={1000}
                height={1000}
              />
            </div>
            <p className="container">
              これにより、文献に書かれている人物、作品、概念、出来事などが互いにどのように関連しているかを直感的に把握できるようになります。物語のように文章で書かれている文脈情報を、この知識グラフとして整理することで、全体像を掴んだり、特定の関連性に着目したりすることが容易になります。ArsTraverseでは、この知識グラフを芸術文化における調査、思考整理、そして他のユーザとの共有・共同作業の中心においています。
            </p>
          </div>
          <div className="hidden flex-col items-center md:flex">
            <Image
              src="/images/about/knowledge-graph.png"
              alt="知識グラフ"
              className="max-w-52"
              width={1000}
              height={1000}
            />
          </div>
        </div>
      </Section>

      <Section className="">
        <div className="divide-y divide-gray-700">
          <SubSection>
            <div className="flex flex-col gap-8">
              <h2 className="text-center text-2xl font-bold lg:text-3xl">
                特徴
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <MainDescription title="文献からの知識グラフ自動構築と可視化">
                  <div>
                    お手持ちの文献（テキスト形式）をアップロードするだけで、AIが作家や概念、作品間の関係性などを自動的に抽出し、知識グラフとして分かりやすく可視化します。
                  </div>
                </MainDescription>
                <MainDescription title="他のユーザとの共有">
                  <div>
                    作成した知識グラフは、ページURLを共有することで、他のユーザと共有することができます。
                  </div>
                </MainDescription>
                <MainDescription title="直感的な情報編集" developing>
                  <div>
                    自動構築された知識グラフに対し、ご自身の知見や仮説、独自の主張を直接書き加えることができます。
                  </div>
                  <Image
                    src="/images/about/graph-editor.png"
                    alt="編集画面"
                    width={1000}
                    height={1000}
                  />
                </MainDescription>
                <MainDescription title="コミュニティでの共同編集" developing>
                  <div>
                    お手持ちの文献（テキスト形式）をアップロードするだけで、AIが作家や概念、作品間の関係性などを自動的に抽出し、知識グラフとして分かりやすく可視化します。調査・整理にかかる時間と労力を大幅に軽減します。
                  </div>
                  <Image
                    src="/images/about/data-repository.png"
                    alt="共同編集"
                    width={1000}
                    height={1000}
                  />
                </MainDescription>
                <MainDescription
                  title="展示などの発表用の柔軟なカスタマイズ"
                  developing
                >
                  <div>
                    作成した知識グラフを、展示パネル、研究論文の図、オンライン記事など、様々な用途に合わせてデザインやインタラクションを調整できます。
                  </div>
                </MainDescription>
              </div>
            </div>
          </SubSection>

          <SubSection>
            <div className="flex flex-col gap-8">
              <h2 className="text-center text-2xl font-bold lg:text-3xl">
                利用シーン
              </h2>

              <div className="flex flex-col gap-4">
                <MainDescription title="文献調査と研究の効率化">
                  <div>
                    論文や書籍などの大量の文献をArsTraverseに取り込み、自動生成された知識グラフによって、登場人物、作品、概念、団体などの複雑な関係性を効率的に把握できます。特定のキーワードや関連性で絞り込みながら情報を探索することで、研究テーマの深掘りや新しい発見につながります。
                  </div>
                </MainDescription>

                <MainDescription title="展覧会・記事の企画">
                  <div>
                    文献情報で得られた知識グラフに、ご自身の解釈や展示の構成案、作家への見解などを直接書き加えて、思考を整理できます。編集した知識グラフを参照しながら、キュレーションの意図を反映した解説文や展示パネルのアウトラインを効率的に作成できます。
                  </div>
                </MainDescription>
                <MainDescription title="アーカイブプロジェクト">
                  <div>
                    特定の芸術運動、作家、地域文化など、関心のあるトピックについて、他の研究者や学芸員と共同で知識グラフを作成・編集し、公開できます。これにより、個人的な調査では限界のある広範な知識を協力して構造化し、相互的なアーカイブとして未来に残していくことが可能になります。
                  </div>
                </MainDescription>
              </div>
            </div>
          </SubSection>

          <SubSection>
            <div className="flex flex-col gap-8">
              <h2 className="text-center text-2xl font-bold lg:text-3xl">
                開発ビジョン
              </h2>

              <div className="flex flex-col gap-4">
                <div>
                  ArsTraverseは、芸術・文化領域における文脈理解を深め、活発な議論と新しい価値創造につながる双方向的なアーカイブを構築することを最終目標として開発を進めています
                </div>
              </div>
            </div>
          </SubSection>
        </div>
      </Section>
    </div>
  );
};

const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`flex w-full flex-col gap-4 px-4 py-8 sm:px-8 sm:py-12 ${className}`}
    >
      {children}
    </div>
  );
};

const SubSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`flex w-full flex-col py-10 ${className}`}>{children}</div>
  );
};

const MainDescription = ({
  children,
  title,
  developing,
}: {
  children: React.ReactNode;
  title: string;
  developing?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row items-center gap-2 sm:justify-center">
        {developing && (
          <div className="flex h-6 min-w-[58px] items-center justify-center rounded-full bg-orange-500 px-2 text-sm text-slate-900">
            開発中
          </div>
        )}
        <h3 className="text-xl font-bold">{title}</h3>
      </div>

      <div className="container flex flex-col gap-3 text-sm">{children}</div>
    </div>
  );
};
