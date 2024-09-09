import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

import background from "./background.png";
import { deposit, withdraw, claim } from "../../api";
import { StateType, useTransfer } from "../../hooks/use-transfer";
import { Button } from "../Button";
import { Modal, ModalButton, ModalPanel } from "../Modal";
import { Tokens } from "../Tokens";
import { TransferButton } from "../TransferButton";

type Props = {
  total: bigint;
  locked: bigint;
  unlockSchedule: {
    amount: bigint;
    date: Date;
  }[];
  lastSlash:
    | {
        amount: bigint;
        date: Date;
      }
    | undefined;
  walletAmount: bigint;
  availableRewards: bigint;
  expiringRewards:
    | {
        amount: bigint;
        expiry: Date;
      }
    | undefined;
  availableToWithdraw: bigint;
};

export const AccountSummary = ({
  locked,
  unlockSchedule,
  lastSlash,
  walletAmount,
  total,
  availableToWithdraw,
  availableRewards,
  expiringRewards,
}: Props) => (
  <section className="relative w-full overflow-hidden border border-neutral-600/50 bg-pythpurple-800">
    <Image
      src={background}
      alt=""
      className="absolute -right-40 hidden h-full object-cover object-right [mask-image:linear-gradient(to_right,_transparent,_black_50%)] md:block"
    />
    <div className="relative flex flex-col items-start justify-between gap-8 px-6 py-10 sm:gap-16 sm:px-12 sm:py-20 lg:flex-row lg:items-center">
      <div>
        <div className="mb-2 inline-block border border-neutral-600/50 bg-neutral-900 px-4 py-1 text-xs text-neutral-400 sm:mb-4">
          Total Balance
        </div>
        <div className="flex flex-row items-center gap-8">
          <span>
            <Tokens className="text-4xl font-light sm:text-6xl">{total}</Tokens>
          </span>
          {lastSlash && (
            <p className="max-w-48 text-sm text-red-600">
              <Tokens>{lastSlash.amount}</Tokens> were slashed on{" "}
              {lastSlash.date.toLocaleString()}
            </p>
          )}
        </div>
        {locked > 0n && (
          <>
            <div className="mt-3 flex flex-row items-center gap-1 text-pythpurple-100/50 sm:mt-6 sm:text-xl">
              <Tokens>{locked}</Tokens>
              <div>locked included</div>
            </div>
            <Modal>
              <ModalButton
                as="button"
                className="mt-1 text-sm text-pythpurple-400 hover:underline"
              >
                Show Unlock Schedule
              </ModalButton>
              <ModalPanel
                title="Unlock Schedule"
                description="Your tokens will become available for withdrawal and for participation in Integrity Staking according to this schedule"
              >
                <div className="border border-neutral-600/50 bg-pythpurple-100/10 p-4 sm:px-8 sm:py-6">
                  <table>
                    <thead className="font-medium">
                      <tr>
                        <td className="pr-12 text-sm text-neutral-400">Date</td>
                        <td className="text-sm text-neutral-400">Amount</td>
                      </tr>
                    </thead>
                    <tbody>
                      {unlockSchedule.map((unlock, i) => (
                        <tr key={i}>
                          <td className="pr-12 text-xs opacity-80 sm:text-sm">
                            {unlock.date.toLocaleString()}
                          </td>
                          <td>
                            <Tokens>{unlock.amount}</Tokens>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ModalPanel>
            </Modal>
          </>
        )}
        <div className="mt-3 flex flex-row items-center gap-4 sm:mt-8">
          <TransferButton
            actionDescription="Add funds to your balance"
            actionName="Add Tokens"
            max={walletAmount}
            transfer={deposit}
          />
        </div>
      </div>
      <div className="flex w-full flex-col items-stretch gap-4 lg:w-auto xl:flex-row">
        <BalanceCategory
          name="Unlocked & Unstaked"
          amount={availableToWithdraw}
          description="The amount of unlocked tokens that are not staked in either program"
          action={
            <TransferButton
              small
              secondary
              actionDescription="Move funds from your account back to your wallet"
              actionName="Withdraw"
              max={availableToWithdraw}
              transfer={withdraw}
              disabled={availableToWithdraw === 0n}
            />
          }
        />
        <BalanceCategory
          name="Available Rewards"
          amount={availableRewards}
          description="Rewards you have earned from OIS"
          action={<ClaimButton disabled={availableRewards === 0n} />}
          {...(expiringRewards !== undefined &&
            expiringRewards.amount > 0n && {
              warning: (
                <>
                  <Tokens>{expiringRewards.amount}</Tokens> will expire on{" "}
                  {expiringRewards.expiry.toLocaleDateString()}
                </>
              ),
            })}
        />
      </div>
    </div>
  </section>
);

type BalanceCategoryProps = {
  name: string;
  amount: bigint;
  description: string;
  action: ReactNode;
  warning?: ReactNode | undefined;
};

const BalanceCategory = ({
  name,
  amount,
  description,
  action,
  warning,
}: BalanceCategoryProps) => (
  <div className="flex w-full flex-col justify-between border border-neutral-600/50 bg-pythpurple-800/60 p-6 backdrop-blur lg:w-96">
    <div>
      <div className="mb-4 inline-block border border-neutral-600/50 bg-neutral-900 px-4 py-1 text-xs text-neutral-400">
        {name}
      </div>
      <div>
        <Tokens className="text-xl font-light">{amount}</Tokens>
      </div>
      <p className="mt-4 max-w-xs text-sm text-neutral-500">{description}</p>
    </div>
    <div className="mt-4 flex flex-row items-center gap-4">
      {action}
      {warning && <p className="max-w-xs text-xs text-red-600">{warning}</p>}
    </div>
  </div>
);

const ClaimButton = (
  props: Omit<
    ComponentProps<typeof Button>,
    "onClick" | "disabled" | "loading"
  >,
) => {
  const { state, execute } = useTransfer(claim);

  return (
    <Button
      small
      secondary
      onClick={execute}
      disabled={state.type !== StateType.Base}
      loading={state.type === StateType.Submitting}
      {...props}
    >
      Claim
    </Button>
  );
};